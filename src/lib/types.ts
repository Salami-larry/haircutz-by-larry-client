export type ServiceType = "walk_in" | "home_service";

export type Hairstyle = {
  id: string;
  name: string;
  description: string;
  walkInPriceKobo: number;
  homeServicePriceKobo: number;
  durationMinutes: number;
  imageUrls: string[];
  videoUrl?: string;
  active: boolean;
};

export type Paginated<T> = {
  items: T[];
  metadata: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
};

export type AvailabilityResult = {
  date: string;
  serviceType: string;
  durationMinutes: number;
  slots: string[];
  closed: boolean;
};

export type Appointment = {
  id: string;
  hairstyleId: string;
  serviceType: ServiceType;
  startAt: string;
  endAt: string;
  status: string;
  totalAmountKobo: number;
  paystackReference?: string;
  trackingNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
};

export type TrackResult = {
  id: string;
  trackingNumber: string;
  status: string;
  statusHistory: { status: string; at: string; note?: string }[];
  serviceType: ServiceType;
  startAt: string;
  endAt: string;
  totalAmountKobo: number;
  hairstyle: {
    hairstyleId: string;
    name: string;
    durationMinutes: number;
    walkInPriceKobo: number;
    homeServicePriceKobo: number;
    imageUrl?: string;
  };
  customerName: string;
  canReschedule: boolean;
};
