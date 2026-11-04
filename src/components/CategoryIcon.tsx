/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShoppingCart,
  Milk,
  Apple,
  Navigation,
  Utensils,
  Fuel,
  Wrench,
  ShoppingBag,
  Film,
  HeartPulse,
  Home,
  Wifi,
  Zap,
  Droplets,
  TrendingUp,
  MoreHorizontal,
  Car,
  Plane,
  BookOpen,
  Coffee,
  Gift,
  Dumbbell,
  Smartphone,
  Laptop,
  Briefcase,
  PiggyBank,
  GraduationCap,
  Baby,
  Smile,
  LucideProps,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  ShoppingCart,
  Milk,
  Apple,
  Navigation,
  Utensils,
  Fuel,
  Wrench,
  ShoppingBag,
  Film,
  HeartPulse,
  Home,
  Wifi,
  Zap,
  Droplets,
  TrendingUp,
  MoreHorizontal,
  Car,
  Plane,
  BookOpen,
  Coffee,
  Gift,
  Dumbbell,
  Smartphone,
  Laptop,
  Briefcase,
  PiggyBank,
  GraduationCap,
  Baby,
  Smile,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  size = 20,
}) => {
  const IconComponent = ICON_MAP[name] || MoreHorizontal;
  return <IconComponent className={className} size={size} color={color} />;
};
