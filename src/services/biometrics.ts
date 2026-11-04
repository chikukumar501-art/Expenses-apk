/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CRED_ID_KEY = 'mem_webauthn_biometric_cred_id';

export const BiometricService = {
  /**
   * Checks if the device has a platform authenticator (Fingerprint, Face Unlock, Touch ID, Windows Hello)
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check WebAuthn support
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return !!available;
      } catch (e) {
        console.warn('Biometric availability check failed:', e);
        return false;
      }
    }
    return false;
  },

  /**
   * Registers a platform biometric credential (enrollment)
   */
  async registerBiometrics(userName = 'My Expense Manager'): Promise<{ success: boolean; error?: string }> {
    if (!window.navigator.credentials) {
      return { success: false, error: 'WebAuthn credentials not supported on this browser.' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const hostname = window.location.hostname || 'localhost';

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'My Expense Manager',
            id: hostname === 'localhost' ? undefined : hostname,
          },
          user: {
            id: userId,
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      })) as PublicKeyCredential | null;

      if (credential && credential.id) {
        localStorage.setItem(CRED_ID_KEY, credential.id);
        return { success: true };
      }
      return { success: false, error: 'Biometric enrollment was cancelled or failed.' };
    } catch (err: any) {
      console.warn('Biometric registration error:', err);
      // If platform authenticator error, still allow setting up with simulated biometric if user device permits
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric enrollment was dismissed or denied by user.' };
      }
      return { success: false, error: err.message || 'Failed to initialize biometric sensor.' };
    }
  },

  /**
   * Prompts device fingerprint / face unlock to authenticate
   */
  async authenticate(): Promise<{ success: boolean; error?: string }> {
    if (!window.navigator.credentials) {
      return { success: false, error: 'Biometric credentials API unavailable.' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const storedCredId = localStorage.getItem(CRED_ID_KEY);
      const allowCredentials: PublicKeyCredentialDescriptor[] = [];

      if (storedCredId) {
        // Base64 decode ID if needed, or convert string to Uint8Array
        try {
          const rawId = Uint8Array.from(atob(storedCredId.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
            c.charCodeAt(0)
          );
          allowCredentials.push({
            id: rawId,
            type: 'public-key',
          });
        } catch {
          // fallback
        }
      }

      const hostname = window.location.hostname || 'localhost';

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: hostname === 'localhost' ? undefined : hostname,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        return { success: true };
      }
      return { success: false, error: 'Biometric verification failed.' };
    } catch (err: any) {
      console.warn('Biometric authentication error:', err);
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric prompt cancelled or timed out.' };
      }
      return { success: false, error: err.message || 'Biometric verification could not be completed.' };
    }
  },

  /**
   * Clears registered credential
   */
  clear(): void {
    localStorage.removeItem(CRED_ID_KEY);
  },
};
