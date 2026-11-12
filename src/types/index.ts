export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  color: string; // Hex or Tailwind color for calendar badges
  role: UserRole;
  avatar?: string;
  pin?: string; // 4-digit personal security PIN
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  address?: string;
  updatedAt: string; // ISO 8601
}

export interface Vehicle {
  id: string;
  name: string; // e.g. "Family Golf", "Blue Tesla"
  model: string;
  licensePlate?: string;
  fuelOrBatteryPercent: number; // 0 - 100
  isElectric: boolean;
  parkingLocation: string; // e.g. "Driveway", "Main St by house #42"
  keyLocation: string; // e.g. "Key bowl in hallway", "Kitchen drawer"
  lastUpdatedBy?: string;
  lastUpdatedAt: string;
  gps?: GpsLocation; // Future-ready field for hardware GPS tracker
}

export type BookingSlotType = 'full-day' | 'morning' | 'afternoon' | 'evening' | 'custom';

export interface Booking {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  userColor: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  slotType: BookingSlotType;
  startTime?: string; // HH:mm (e.g. "08:00")
  endTime?: string;   // HH:mm (e.g. "13:00")
  destinationNote?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface WaitingListEntry {
  id: string;
  familyId: string;
  bookingId: string; // Confirmed booking they want to take
  userId: string;
  userName: string;
  userColor: string;
  date: string; // YYYY-MM-DD
  slotType: BookingSlotType;
  startTime?: string;
  endTime?: string;
  status: 'waiting' | 'offered' | 'resolved';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  familyId: string;
  recipientUserId: string;
  actorName: string;
  title: string;
  message: string;
  date: string; // Relevant booking date
  type: 'waiting_list_joined' | 'booking_cancelled' | 'slot_freed' | 'car_returned';
  read: boolean;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  joinCode: string;
  passcode: string; // Family security passcode protecting access
  createdAt: string;
  adminId: string;
  members: Record<string, UserProfile>;
  vehicle: Vehicle;
}
