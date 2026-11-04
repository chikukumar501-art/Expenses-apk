/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    // App Brand
    appName: 'My Expense Manager',
    appSubtitle: 'Daily Expense Tracker',

    // Bottom Navigation
    navHome: 'Home',
    navTransactions: 'Transactions',
    navReports: 'Reports',
    navCategories: 'Categories',
    navSettings: 'Settings',

    // Dashboard Cards
    todayExpenses: "Today's Expenses",
    thisMonthExpenses: 'This Month',
    thisYearExpenses: 'This Year (FY)',
    totalEntries: 'Total Entries',
    highestCategory: 'Top Spending Category',
    remainingBudget: 'Remaining Budget',
    spent: 'Spent',
    budget: 'Budget',
    budgetUtilization: 'Utilization',
    budgetWarning: 'Warning: 80% budget reached!',
    budgetExceeded: 'Alert: Budget exceeded!',
    noBudgetSet: 'No monthly budget set',
    setBudgetPrompt: 'Set Budget',

    // Dashboard Sections
    todayList: "Today's Expenses",
    recentTransactions: 'Recent Transactions',
    categorySummary: 'Category Summary',
    monthlyExpenseChart: 'Monthly Spending Overview',
    viewAll: 'View All',
    noExpensesToday: 'No expenses recorded today.',
    noRecentTransactions: 'No recent expenses found.',
    addFirstExpense: 'Add your first expense to get started!',
    addExpenseBtn: 'Add Expense',
    quickAdd: 'Quick Add',

    // Add / Edit Expense Form
    newExpenseTitle: 'Add New Expense',
    editExpenseTitle: 'Edit Expense',
    amountLabel: 'Expense Amount (₹)',
    categoryLabel: 'Expense Category',
    dateLabel: 'Expense Date',
    descriptionLabel: 'Description / Note (Optional)',
    descriptionPlaceholder: 'Add a note (optional)',
    paymentMethodLabel: 'Payment Method',
    merchantLabel: 'Merchant / Shop Name (Optional)',
    merchantPlaceholder: 'e.g. D-Mart, Indian Oil, Swiggy, Reliance Fresh',
    receiptPhotoLabel: 'Receipt Photo (Optional)',
    uploadReceipt: 'Upload Receipt / Bill',
    changeReceipt: 'Change Photo',
    removeReceipt: 'Remove',
    tagsLabel: 'Tags (Optional)',
    tagsPlaceholder: 'Add tags e.g. #personal, #office, #urgent (press Enter)',
    cancel: 'Cancel',
    saveExpense: 'Save Expense',
    updateExpense: 'Update Expense',
    amountRequired: 'Please enter a valid amount greater than ₹0.',
    categoryRequired: 'Please select an expense category.',
    dateRequired: 'Please select a valid date.',

    // Payment Methods
    pmCash: 'Cash',
    pmUPI: 'UPI',
    pmDebit: 'Debit Card',
    pmCredit: 'Credit Card',
    pmBank: 'Bank Transfer',
    pmOther: 'Other',

    // Date-wise View
    dateWiseTitle: 'Date-wise Expenses',
    selectDate: 'Select Date',
    totalOnDate: 'Total Spent on Date',
    categorySpendingOnDate: 'Category Breakdown on this Date',
    addExpenseOnThisDate: 'Add Expense on this Date',
    noExpensesOnDate: 'No expenses found on this date.',

    // Reports Tabs
    reportMonthly: 'Monthly',
    reportQuarterly: 'Quarterly',
    reportYearly: 'Yearly',
    reportCustom: 'Custom Range',
    reportCategory: 'Category-wise',

    // Monthly Report
    selectMonthYear: 'Select Month & Year',
    monthExpensesTotal: 'Total Monthly Expenses',
    highestSpendingDay: 'Highest Spending Day',
    averageDailyExpense: 'Daily Average',
    comparePreviousMonth: 'vs Previous Month',
    dailyTrendChart: 'Daily Spending Trend',
    categoryShare: 'Category Spending Share',
    allDaysList: 'Day-wise Expenses',

    // Quarterly Report
    financialYear: 'Financial Year',
    quarter: 'Quarter',
    selectQuarter: 'Select Quarter',
    totalQuarterlyExpenses: 'Total Quarterly Expenses',
    monthWiseBreakdown: 'Month-wise Breakdown',
    quarterComparison: 'Quarterly Comparison',

    // Yearly Report
    totalYearlyExpenses: 'Total Yearly Expenses',
    highestSpendingMonth: 'Highest Spending Month',
    averageMonthlyExpense: 'Average Monthly Expense',
    monthlyTrendChart: '12 Months Expense Trend',

    // Custom Date Range
    customRangeTitle: 'Custom Date Range Report',
    startDate: 'Start Date',
    endDate: 'End Date',
    applyFilter: 'Generate Report',
    periodTotal: 'Total Expenses in Period',
    transactionsCount: 'Transactions Count',
    dailyAverage: 'Average Daily Spend',

    // Category Report
    selectCategory: 'Select Category',
    timeFilterToday: 'Today',
    timeFilterWeek: 'This Week',
    timeFilterMonth: 'This Month',
    timeFilterQuarter: 'This Quarter',
    timeFilterYear: 'This Year',
    timeFilterCustom: 'Custom Date',
    totalInCategory: 'Total Spent in Category',
    transactionsInCategory: 'Category Transactions',
    previousPeriodComparison: 'vs Prior Period',

    // Category Management
    categoriesTitle: 'Expense Categories',
    addNewCategory: 'Add New Category',
    editCategory: 'Edit Category',
    categoryNameEn: 'Category Name (English)',
    categoryNameHi: 'Category Name (Hindi)',
    categoryIcon: 'Select Icon',
    categoryColor: 'Color Accent',
    categoryBudget: 'Monthly Budget (₹, Optional)',
    saveCategory: 'Save Category',
    deleteCategory: 'Delete Category',
    categoryDeleteConfirm: 'Are you sure you want to delete this custom category?',
    categoryHasExpensesAlert: 'Cannot delete! This category contains {count} expense records. Please reassign or delete those expenses first.',
    defaultBadge: 'Default',
    customBadge: 'Custom',
    individualEntries: 'Individual Entries',
    totalSpent: 'Total Spent',
    txCount: 'Transactions',

    // Transaction Management
    transactionsTitle: 'All Transactions',
    searchPlaceholder: 'Search note, merchant, tag, or category...',
    filterCategory: 'All Categories',
    filterPaymentMethod: 'All Payment Methods',
    sortBy: 'Sort By',
    sortDateDesc: 'Date: Newest First',
    sortDateAsc: 'Date: Oldest First',
    sortAmountDesc: 'Amount: High to Low',
    sortAmountAsc: 'Amount: Low to High',
    showingResults: 'Showing {count} expenses totaling {total}',
    edit: 'Edit',
    delete: 'Delete',
    viewReceipt: 'View Receipt',
    deleteConfirmTitle: 'Delete Expense?',
    deleteConfirmMessage: 'Are you sure you want to delete this expense record? This action cannot be undone.',
    confirmDeleteBtn: 'Delete',

    // Budget Management (Settings)
    budgetSettingsTitle: 'Budget Management',
    overallBudgetLabel: 'Overall Monthly Budget (₹)',
    setOverallBudgetHelper: 'Set a global spending cap for each calendar month.',
    categoryBudgetsTitle: 'Category-wise Monthly Budgets',
    saveBudgetBtn: 'Save Budget Settings',
    budgetSavedSuccess: 'Budget settings updated successfully!',

    // Settings
    settingsTitle: 'Settings & Preferences',
    appPreferences: 'App Preferences',
    languageLabel: 'Application Language',
    themeLabel: 'Appearance',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    currencyLabel: 'Default Currency',

    // Data Export & Backup
    dataExportBackup: 'Data Export & Backup',
    exportCSV: 'Export to CSV',
    exportCSVDesc: 'Download spreadsheet with date, category, note, payment method, amount.',
    exportExcel: 'Export to Excel (.xlsx/.tsv)',
    exportExcelDesc: 'Clean Excel-friendly spreadsheet with Indian Rupee formatting.',
    exportPDF: 'Generate PDF Report',
    exportPDFDesc: 'Print or save formal formatted expense summary report.',
    backupJSON: 'Backup Database (JSON)',
    backupJSONDesc: 'Create a full offline backup of all expenses, categories, and budgets.',
    restoreJSON: 'Restore Database (JSON)',
    restoreJSONDesc: 'Restore your records from a previously saved backup file.',
    restoreSuccess: 'Database restored successfully!',
    restoreError: 'Failed to restore: Invalid backup file format.',
    demoDataTitle: 'Demo Testing',
    loadDemoData: 'Load Sample Records (Testing)',
    clearAllData: 'Reset All Data',
    clearAllConfirm: 'Are you sure you want to delete all expenses? This cannot be undone.',

    // Android APK Section
    androidApkTitle: 'Android Smartphone App (APK)',
    androidApkSubtitle: 'Install on Android or Build APK',
    installPwaBtn: 'Install App on Phone',
    apkBuildInstructions: 'How to Build Android APK (.apk)',
    apkGuideDesc: 'Step-by-step instructions to compile Debug and Release APKs via Android Studio or Capacitor CLI.',

    // Screen Lock & Biometrics
    securityLockTitle: 'Screen Lock & Biometrics',
    securityLockSubtitle: 'Secure financial records with fingerprint, face unlock or PIN',
    enableScreenLock: 'Enable Screen Lock',
    biometricAuth: 'Device Biometrics (Fingerprint / Face)',
    biometricDesc: 'Unlock instantly using Android fingerprint sensor or face recognition',
    biometricNotAvailable: 'Biometric hardware not detected or not set up on this device.',
    biometricPrompt: 'Unlock with Biometrics',
    biometricScanning: 'Touch fingerprint sensor or look at screen...',
    enterPin: 'Enter 4-Digit Security PIN',
    setupPin: 'Set Security PIN',
    changePin: 'Change Security PIN',
    confirmPin: 'Confirm 4-Digit PIN',
    pinMismatch: 'PINs do not match. Please try again.',
    pinIncorrect: 'Incorrect PIN. Please try again.',
    pinLengthError: 'PIN must be exactly 4 digits.',
    pinSaved: 'Security PIN configured successfully!',
    autoLockLabel: 'Auto-Lock Inactivity Timeout',
    autoLockImmediate: 'Immediately (On App Switch)',
    autoLock1Min: 'After 1 Minute',
    autoLock5Min: 'After 5 Minutes',
    autoLock15Min: 'After 15 Minutes',
    lockAppNow: 'Lock App Now',
    appLocked: 'App Locked for Privacy',
    appLockedDesc: 'Authenticate to access your private expenses and financial statements.',
    useBiometricBtn: 'Use Fingerprint / Face',
    usePinBtn: 'Use PIN Pad Instead',
    forgotPinHelp: 'Forgot PIN? You can authenticate with device biometrics or reset via backup.',

    // Common
    loading: 'Loading...',
    close: 'Close',
    success: 'Success',
    error: 'Error',
    tagSpecialSavings: 'Savings & Investments (Wealth Building)',
  },
  hi: {
    // App Brand
    appName: 'माई एक्सपेंस मैनेजर',
    appSubtitle: 'दैनिक खर्च ट्रैकर',

    // Bottom Navigation
    navHome: 'होम',
    navTransactions: 'लेन-देन',
    navReports: 'रिपोर्ट्स',
    navCategories: 'श्रेणियां',
    navSettings: 'सेटिंग्स',

    // Dashboard Cards
    todayExpenses: 'आज का खर्च',
    thisMonthExpenses: 'इस महीने का खर्च',
    thisYearExpenses: 'इस वित्तीय वर्ष का खर्च',
    totalEntries: 'कुल खर्च प्रविष्टियां',
    highestCategory: 'सर्वाधिक खर्च श्रेणी',
    remainingBudget: 'बचा हुआ बजट',
    spent: 'खर्च हुआ',
    budget: 'बजट',
    budgetUtilization: 'उपयोगिता',
    budgetWarning: 'चेतावनी: 80% बजट खर्च हो चुका है!',
    budgetExceeded: 'सावधान: मासिक बजट पार हो गया!',
    noBudgetSet: 'कोई मासिक बजट निर्धारित नहीं',
    setBudgetPrompt: 'बजट सेट करें',

    // Dashboard Sections
    todayList: 'आज के खर्चे',
    recentTransactions: 'हाल के लेन-देन',
    categorySummary: 'श्रेणी-वार खर्च सारांश',
    monthlyExpenseChart: 'मासिक खर्च चार्ट',
    viewAll: 'सभी देखें',
    noExpensesToday: 'आज कोई खर्च दर्ज नहीं किया गया।',
    noRecentTransactions: 'कोई हालिया खर्च नहीं मिला।',
    addFirstExpense: 'शुरुआत करने के लिए अपना पहला खर्च जोड़ें!',
    addExpenseBtn: 'खर्च जोड़ें',
    quickAdd: 'तुरंत जोड़ें',

    // Add / Edit Expense Form
    newExpenseTitle: 'नया खर्च जोड़ें',
    editExpenseTitle: 'खर्च संपादित करें',
    amountLabel: 'खर्च राशि (₹)',
    categoryLabel: 'खर्च की श्रेणी',
    dateLabel: 'खर्च की तारीख',
    descriptionLabel: 'विवरण / नोट (वैकल्पिक)',
    descriptionPlaceholder: 'नोट जोड़ें (वैकल्पिक)',
    paymentMethodLabel: 'भुगतान का तरीका',
    merchantLabel: 'दुकानदार / मर्चेंट का नाम (वैकल्पिक)',
    merchantPlaceholder: 'उदा. डी-मार्ट, इंडियन ऑयल, स्विगी',
    receiptPhotoLabel: 'रसीद / बिल फोटो (वैकल्पिक)',
    uploadReceipt: 'रसीद अपलोड करें',
    changeReceipt: 'फोटो बदलें',
    removeReceipt: 'हटाएं',
    tagsLabel: 'टैग (वैकल्पिक)',
    tagsPlaceholder: 'टैग जोड़ें उदा. #personal, #office, #urgent (Enter दबाएं)',
    cancel: 'रद्द करें',
    saveExpense: 'खर्च सहेजें',
    updateExpense: 'अपडेट करें',
    amountRequired: 'कृपया ₹0 से अधिक वैध राशि दर्ज करें।',
    categoryRequired: 'कृपया एक श्रेणी चुनें।',
    dateRequired: 'कृपया मान्य तारीख चुनें।',

    // Payment Methods
    pmCash: 'नकद (Cash)',
    pmUPI: 'यूपीआई (UPI)',
    pmDebit: 'डेबिट कार्ड',
    pmCredit: 'क्रेडिट कार्ड',
    pmBank: 'बैंक ट्रांसफर',
    pmOther: 'अन्य',

    // Date-wise View
    dateWiseTitle: 'तारीख अनुसार खर्च',
    selectDate: 'तारीख चुनें',
    totalOnDate: 'इस तारीख को कुल खर्च',
    categorySpendingOnDate: 'इस तारीख का श्रेणी-वार खर्च',
    addExpenseOnThisDate: 'इस तारीख के लिए खर्च जोड़ें',
    noExpensesOnDate: 'इस तारीख पर कोई खर्च दर्ज नहीं है।',

    // Reports Tabs
    reportMonthly: 'मासिक',
    reportQuarterly: 'त्रैमासिक',
    reportYearly: 'वार्षिक',
    reportCustom: 'कस्टम तारीख',
    reportCategory: 'श्रेणी-वार',

    // Monthly Report
    selectMonthYear: 'माह और वर्ष चुनें',
    monthExpensesTotal: 'कुल मासिक खर्च',
    highestSpendingDay: 'सर्वाधिक खर्च वाला दिन',
    averageDailyExpense: 'दैनिक औसत',
    comparePreviousMonth: 'पिछले महीने की तुलना में',
    dailyTrendChart: 'दैनिक खर्च का रुझान',
    categoryShare: 'श्रेणी-वार हिस्सेदारी',
    allDaysList: 'दिन-वार खर्च सूची',

    // Quarterly Report
    financialYear: 'वित्तीय वर्ष',
    quarter: 'तिमाही (क्वार्टर)',
    selectQuarter: 'तिमाही चुनें',
    totalQuarterlyExpenses: 'कुल त्रैमासिक खर्च',
    monthWiseBreakdown: 'माह-वार विवरण',
    quarterComparison: 'तिमाही तुलना',

    // Yearly Report
    totalYearlyExpenses: 'कुल वार्षिक खर्च',
    highestSpendingMonth: 'सर्वाधिक खर्च वाला महीना',
    averageMonthlyExpense: 'मासिक औसत खर्च',
    monthlyTrendChart: '12 महीनों का खर्च चार्ट',

    // Custom Date Range
    customRangeTitle: 'कस्टम तारीख रेंज रिपोर्ट',
    startDate: 'आरंभिक तारीख',
    endDate: 'अंतिम तारीख',
    applyFilter: 'रिपोर्ट बनाएं',
    periodTotal: 'अवधि के दौरान कुल खर्च',
    transactionsCount: 'लेन-देन की कुल संख्या',
    dailyAverage: 'दैनिक औसत खर्च',

    // Category Report
    selectCategory: 'श्रेणी चुनें',
    timeFilterToday: 'आज',
    timeFilterWeek: 'इस सप्ताह',
    timeFilterMonth: 'इस महीने',
    timeFilterQuarter: 'इस तिमाही',
    timeFilterYear: 'इस वर्ष',
    timeFilterCustom: 'कस्टम तारीख',
    totalInCategory: 'इस श्रेणी में कुल खर्च',
    transactionsInCategory: 'श्रेणी के कुल लेन-देन',
    previousPeriodComparison: 'पिछली अवधि की तुलना में',

    // Category Management
    categoriesTitle: 'खर्च श्रेणियां',
    addNewCategory: 'नई श्रेणी जोड़ें',
    editCategory: 'श्रेणी संपादित करें',
    categoryNameEn: 'श्रेणी का नाम (अंग्रेजी)',
    categoryNameHi: 'श्रेणी का नाम (हिंदी)',
    categoryIcon: 'आइकन चुनें',
    categoryColor: 'रंग थीम',
    categoryBudget: 'मासिक बजट (₹, वैकल्पिक)',
    saveCategory: 'श्रेणी सहेजें',
    deleteCategory: 'श्रेणी हटाएं',
    categoryDeleteConfirm: 'क्या आप निश्चित रूप से इस कस्टम श्रेणी को हटाना चाहते हैं?',
    categoryHasExpensesAlert: 'हटाया नहीं जा सकता! इस श्रेणी में {count} खर्च दर्ज हैं। कृपया पहले उन खर्चों को दूसरी श्रेणी में बदलें या हटाएं।',
    defaultBadge: 'डिफ़ॉल्ट',
    customBadge: 'कस्टम',
    individualEntries: 'व्यक्तिगत प्रविष्टियां',
    totalSpent: 'कुल खर्च',
    txCount: 'लेन-देन',

    // Transaction Management
    transactionsTitle: 'सभी लेन-देन',
    searchPlaceholder: 'नोट, मर्चेंट, टैग या श्रेणी खोजें...',
    filterCategory: 'सभी श्रेणियां',
    filterPaymentMethod: 'सभी भुगतान विधियां',
    sortBy: 'क्रमबद्ध करें',
    sortDateDesc: 'तारीख: नई से पुरानी',
    sortDateAsc: 'तारीख: पुरानी से नई',
    sortAmountDesc: 'राशि: अधिक से कम',
    sortAmountAsc: 'राशि: कम से अधिक',
    showingResults: '{count} खर्च दिखाए जा रहे हैं, कुल {total}',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    viewReceipt: 'रसीद देखें',
    deleteConfirmTitle: 'खर्च हटाएं?',
    deleteConfirmMessage: 'क्या आप निश्चित रूप से इस खर्च को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    confirmDeleteBtn: 'हटाएं',

    // Budget Management (Settings)
    budgetSettingsTitle: 'बजट प्रबंधन',
    overallBudgetLabel: 'कुल मासिक बजट (₹)',
    setOverallBudgetHelper: 'हर कैलेंडर माह के लिए एक समग्र खर्च सीमा निर्धारित करें।',
    categoryBudgetsTitle: 'श्रेणी-वार मासिक बजट',
    saveBudgetBtn: 'बजट सेटिंग्स सहेजें',
    budgetSavedSuccess: 'बजट सफलतापूर्वक सहेजा गया!',

    // Settings
    settingsTitle: 'सेटिंग्स और प्राथमिकताएं',
    appPreferences: 'ऐप प्राथमिकताएं',
    languageLabel: 'ऐप की भाषा (Language)',
    themeLabel: 'थीम (Appearance)',
    themeLight: 'लाइट मोड (Light)',
    themeDark: 'डार्क मोड (Dark)',
    currencyLabel: 'डिफ़ॉल्ट मुद्रा',

    // Data Export & Backup
    dataExportBackup: 'डेटा निर्यात और बैकअप',
    exportCSV: 'CSV फाइल निर्यात करें',
    exportCSVDesc: 'तारीख, श्रेणी, विवरण, विधि, राशि सहित स्प्रेडशीट डाउनलोड करें।',
    exportExcel: 'Excel प्रारूप में निर्यात करें',
    exportExcelDesc: 'भारतीय मुद्रा प्रारूप के साथ स्वच्छ एक्सेल स्प्रेडशीट।',
    exportPDF: 'PDF रिपोर्ट तैयार करें',
    exportPDFDesc: 'प्रिंट या पीडीएफ के रूप में औपचारिक खर्च रिपोर्ट सहेजें।',
    backupJSON: 'डेटाबेस बैकअप (JSON)',
    backupJSONDesc: 'सभी खर्चों, श्रेणियों और बजट का पूर्ण सुरक्षित बैकअप बनाएं।',
    restoreJSON: 'डेटाबेस पुनर्स्थापित करें (JSON)',
    restoreJSONDesc: 'पहले से सहेजी गई बैकअप फ़ाइल से अपने रिकॉर्ड पुनर्स्थापित करें।',
    restoreSuccess: 'डेटाबेस सफलतापूर्वक पुनर्स्थापित हुआ!',
    restoreError: 'पुनर्स्थापित करने में विफल: अमान्य फ़ाइल प्रारूप।',
    demoDataTitle: 'परीक्षण डेटा',
    loadDemoData: 'नमूना डेटा लोड करें (Testing)',
    clearAllData: 'सभी डेटा मिटाएं',
    clearAllConfirm: 'क्या आप सभी खर्च मिटाना चाहते हैं? यह क्रिया पूर्ववत नहीं हो सकती।',

    // Android APK Section
    androidApkTitle: 'एंड्रॉइड स्मार्टफोन ऐप (APK)',
    androidApkSubtitle: 'फोन में इंस्टॉल करें या APK बनाएं',
    installPwaBtn: 'फोन में ऐप इंस्टॉल करें',
    apkBuildInstructions: 'एंड्रॉइड APK कैसे बनाएं (.apk)',
    apkGuideDesc: 'Android Studio या Capacitor CLI के माध्यम से Debug और Release APK तैयार करने के आसान निर्देश।',

    // Screen Lock & Biometrics
    securityLockTitle: 'स्क्रीन लॉक और बायोमेट्रिक्स',
    securityLockSubtitle: 'फिंगरप्रिंट, फेस अनलॉक या पिन से अपने वित्तीय डेटा को सुरक्षित रखें',
    enableScreenLock: 'स्क्रीन लॉक सक्षम करें',
    biometricAuth: 'डिवाइस बायोमेट्रिक्स (फिंगरप्रिंट / फेस)',
    biometricDesc: 'एंड्रॉइड फिंगरप्रिंट सेंसर या फेस रिकग्निशन से तुरंत अनलॉक करें',
    biometricNotAvailable: 'इस डिवाइस पर बायोमेट्रिक सेंसर नहीं मिला या सेट नहीं है।',
    biometricPrompt: 'बायोमेट्रिक्स से अनलॉक करें',
    biometricScanning: 'फिंगरप्रिंट सेंसर छुएं या स्क्रीन की ओर देखें...',
    enterPin: '4-अंकीय सुरक्षा पिन दर्ज करें',
    setupPin: 'सुरक्षा पिन सेट करें',
    changePin: 'सुरक्षा पिन बदलें',
    confirmPin: 'पिन की पुष्टि करें',
    pinMismatch: 'पिन मेल नहीं खाते। कृपया पुनः प्रयास करें।',
    pinIncorrect: 'गलत पिन। कृपया पुनः प्रयास करें।',
    pinLengthError: 'पिन ठीक 4 अंकों का होना चाहिए।',
    pinSaved: 'सुरक्षा पिन सफलतापूर्वक सहेजा गया!',
    autoLockLabel: 'ऑटो-लॉक समय सीमा',
    autoLockImmediate: 'तुरंत (ऐप बदलते ही)',
    autoLock1Min: '1 मिनट बाद',
    autoLock5Min: '5 मिनट बाद',
    autoLock15Min: '15 मिनट बाद',
    lockAppNow: 'ऐप अभी लॉक करें',
    appLocked: 'गोपनीयता के लिए ऐप लॉक है',
    appLockedDesc: 'अपने वित्तीय रिकॉर्ड देखने के लिए फिंगरप्रिंट, फेस या पिन से अनलॉक करें।',
    useBiometricBtn: 'फिंगरप्रिंट / फेस का उपयोग करें',
    usePinBtn: 'पिन पैड का उपयोग करें',
    forgotPinHelp: 'पिन भूल गए? डिवाइस बायोमेट्रिक्स से अनलॉक करें या बैकअप से रीसेट करें।',

    // Common
    loading: 'लोड हो रहा है...',
    close: 'बंद करें',
    success: 'सफल',
    error: 'त्रुटि',
    tagSpecialSavings: 'बचत और निवेश (सम्पत्ति निर्माण)',
  },
};

export function t(key: keyof typeof TRANSLATIONS.en, lang: Language = 'en', params?: Record<string, string | number>): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = dictionary[key] || TRANSLATIONS.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}
