import {
  Clock,
  Code,
  DoorOpen,
  Network,
  ShieldCheck,
  Video,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceDef {
  name: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  description: string;
  features: { label: string; chipClass: string }[];
}

export const SERVICES: ServiceDef[] = [
  {
    name: 'CCTV Systems',
    icon: Video,
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    description: 'Professional installation, repair, and maintenance for home & business security.',
    features: [
      { label: 'Installation', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: 'Repair', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'Maintenance', chipClass: 'bg-purple-500/10 text-purple-300' },
    ],
  },
  {
    name: 'Network Solutions',
    icon: Network,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    description: 'Structured cabling, switching, Wi-Fi deployment and network optimization.',
    features: [
      { label: 'Cabling', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: 'Switching', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'Wi-Fi', chipClass: 'bg-purple-500/10 text-purple-300' },
      { label: 'Optimization', chipClass: 'bg-orange-500/10 text-orange-300' },
    ],
  },
  {
    name: 'Time Attendance',
    icon: Clock,
    color: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    description: 'Biometric fingerprint and face-recognition time attendance systems.',
    features: [
      { label: 'Biometric', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: 'Face Recognition', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'Reports', chipClass: 'bg-purple-500/10 text-purple-300' },
    ],
  },
  {
    name: 'Video Intercom',
    icon: DoorOpen,
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    description: 'Secure visitor verification and door access intercom systems.',
    features: [
      { label: 'Visitor Access', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: '2-Way Audio', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'Night Vision', chipClass: 'bg-purple-500/10 text-purple-300' },
    ],
  },
  {
    name: 'Web & IT Solutions',
    icon: Code,
    color: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    description: 'Websites, e-commerce platforms and professional IT consulting.',
    features: [
      { label: 'Websites', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: 'E-commerce', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'IT Consulting', chipClass: 'bg-purple-500/10 text-purple-300' },
    ],
  },
  {
    name: 'Access Control',
    icon: ShieldCheck,
    color: 'text-red-400',
    iconBg: 'bg-red-500/10',
    description: 'Electronic locks, keypad entry and biometric access control.',
    features: [
      { label: 'Electronic Locks', chipClass: 'bg-blue-500/10 text-blue-300' },
      { label: 'Keypad', chipClass: 'bg-emerald-500/10 text-emerald-300' },
      { label: 'Biometric', chipClass: 'bg-purple-500/10 text-purple-300' },
    ],
  },
];
