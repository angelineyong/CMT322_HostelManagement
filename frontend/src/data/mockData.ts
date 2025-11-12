import type { Task } from "../types";

// ✅ Categories for sidebar or navigation
export const categories = [
  {
    id: "shared",
    title: "Shared Category",
    count: 15,
    children: [
      { id: "pantry", title: "Pantry", items: [], count: 5 },
      { id: "corridor", title: "Corridor", items: [], count: 10 },
    ],
  },
  {
    id: "individual",
    title: "Individual Category",
    count: 4,
    children: [
      {
        id: "furniture",
        title: "Furniture",
        count: 2,
        items: [
          {
            id: "TASK10003",
            desc: "Table leg broken",
            openedAt: "2025-10-26 03:55:40",
          },
          {
            id: "TASK10004",
            desc: "Wardrobe hinge loose",
            openedAt: "2025-10-26 10:24:15",
          },
        ],
      },
      {
        id: "ceiling-fan",
        title: "Ceiling Fan",
        count: 2,
        items: [
          {
            id: "TASK10001",
            desc: "Fan malfunction",
            openedAt: "2025-10-25 09:12:22",
          },
          {
            id: "TASK10002",
            desc: "Humming sound from the motor",
            openedAt: "2025-10-25 12:40:00",
          },
        ],
      },
    ],
  },
];

// ✅ Detailed mock task data
export const taskCategoryMap: Record<string, Task[]> = {
  "ceiling-fan": [
    {
      id: "TASK10001",
      desc: "Fan malfunction",
      category: "Individual",
      subcategory: "Fan",
      matricNo: "123456",
      hpNo: "01X-XXXXXXX",
      location: "M01/XX-XXA",
      date: "2025-10-26",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-26 03:55:40",
      openedBy: "Student 1",
      status: "In Progress",
    },
    {
      id: "TASK10002",
      desc: "Humming sound from the motor",
      category: "Individual",
      subcategory: "Fan",
      matricNo: "123457",
      hpNo: "01X-XXXXXXX",
      location: "M02/YY-YYB",
      date: "2025-10-25",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Alicia Lee",
      openedAt: "2025-10-25 12:40:00",
      openedBy: "Student 2",
      status: "Pending",
    },
  ],
  furniture: [
    {
      id: "TASK10003",
      desc: "Table leg broken",
      category: "Individual",
      subcategory: "Furniture",
      matricNo: "123458",
      hpNo: "01X-XXXXXXX",
      location: "M03/AA-XXB",
      date: "2025-10-26",
      assignmentGroup: "INDUK-TEKUN",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-26 03:55:40",
      openedBy: "Student 3",
      status: "Completed",
    },
    {
      id: "TASK10004",
      desc: "Wardrobe hinge loose",
      category: "Individual",
      subcategory: "Furniture",
      matricNo: "123459",
      hpNo: "01X-XXXXXXX",
      location: "M04/CC-XXC",
      date: "2025-10-26",
      assignmentGroup: "INDUK-IK",
      assignedTo: "Sara Ng",
      openedAt: "2025-10-26 10:24:15",
      openedBy: "Student 4",
      status: "In Progress",
    },
  ],
};

// ✅ Dropdown options
export const groupOptions = [
  "INDUK-RESTU",
  "INDUK-TEKUN",
  "INDUK-IK",
  "INDUK-CGH",
  "INDUK-FAJAR",
  "INDUK-AD",
  "KKJ-A",
  "KKJ-B",
  "KKJ-C",
];

export const staffOptions = [
  "Kevin Goh",
  "John Tan",
  "Alicia Lee",
  "Alex Wong",
  "Sara Ng",
  "Mohd Faiz",
  "Steve Edward",
  "Calvin Lee",
  "Ray Cheang",
  "Evelyn Teo",
];

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalTasks: number;
  tasksResolved?: number;
  averageRating: number;
  recentFeedback: Feedback[];
  ratingTrend: RatingTrend[];
}

export interface Feedback {
  complaintId: string;
  student: string;
  rating: number; // Out of 5
  comments: string;
  description: string
  location: string,
  roomNumber: string,
  assignmentGroup: string,
  dateSubmitted: string,
}

export interface RatingTrend {
  month: string; // e.g., "May 2025"
  averageRating: number;
}

export const staffPerformanceData: StaffPerformance[] = [
  {
    staffId: "S001",
    staffName: "Kevin Goh",
    totalTasks: 35,
    tasksResolved: 32,
    averageRating: 4.3,
    recentFeedback: [
      {
        complaintId: "TASK10001",
        student: "Alice Lim",
        rating: 5,
        comments: "Great service, very prompt!",
        description: "Leaky faucet in bathroom",
        location: "M06",
        roomNumber: "01-7A",
        assignmentGroup: "Toilet",
        dateSubmitted: "2025-05-02",
      },
      {
        complaintId: "TASK10002",
        student: "Brian Tan",
        rating: 2.7,
        comments: "Good response but slightly delayed.",
        description: "Fan not working",
        location: "M05",
        roomNumber: "03-29B",
        assignmentGroup: "Ceiling Fan",
        dateSubmitted: "2025-05-05",
      },
      {
        complaintId: "TASK10003",
        student: "Cindy Wong",
        rating: 4.2,
        comments: "Resolved efficiently.",
        description: "Broken locker door",
        location: "K05",
        roomNumber: "03-26B",
        assignmentGroup: "Door",
        dateSubmitted: "2025-05-07",
      },
    ],
    ratingTrend: [
      { month: "May 2025", averageRating: 3.9 },
      { month: "Apr 2025", averageRating: 4.4 },
      { month: "Mar 2025", averageRating: 3.0 },
      { month: "Feb 2025", averageRating: 4.2 },
      { month: "Jan 2025", averageRating: 4.1 },
      { month: "Dec 2024", averageRating: 3.0 },
    ],
  },
  {
    staffId: "S002",
    staffName: "Ray",
    totalTasks: 42,
    tasksResolved: 40,
    averageRating: 4.6,
    recentFeedback: [
      {
        complaintId: "TASK10010",
        student: "David Ng",
        rating: 5,
        comments: "Excellent!",
        description: "",
        location: "",
        roomNumber: "",
        assignmentGroup: "",
        dateSubmitted: "",
      },
      {
        complaintId: "TASK10012",
        student: "Emily Tan",
        rating: 4,
        comments: "Good service.",
        description: "",
        location: "",
        roomNumber: "",
        assignmentGroup: "",
        dateSubmitted: "",
      },
    ],
    ratingTrend: [
      { month: "May 2025", averageRating: 4.7 },
      { month: "Apr 2025", averageRating: 4.6 },
      { month: "Mar 2025", averageRating: 2.7 },
      { month: "Feb 2025", averageRating: 4.5 },
      { month: "Jan 2025", averageRating: 4.5 },
      { month: "Dec 2024", averageRating: 4.4 },
    ],
  },
];

export const dashboardCards = {
  openedTickets: 124,
  overdueTickets: 17,
  resolvedThisMonth: 92,
  mostReportedFacility: { category: "Furniture", percentage: 32 },
};

export const staffTaskData = [
  { staffName: "Kevin Goh", tasksInHand: 12, oldestTicketDays: 7 },
  { staffName: "Ray", tasksInHand: 8, oldestTicketDays: 3 },
  { staffName: "Calvin", tasksInHand: 15, oldestTicketDays: 12 },
  { staffName: "Steve", tasksInHand: 5, oldestTicketDays: 1 },
];

export const trendData = [
  { month: "May", complaints: 45, satisfaction: 4.2 },
  { month: "Jun", complaints: 50, satisfaction: 3.9 },
  { month: "Jul", complaints: 38, satisfaction: 4.5 },
  { month: "Aug", complaints: 60, satisfaction: 4.1 },
  { month: "Sep", complaints: 55, satisfaction: 4.0 },
  { month: "Oct", complaints: 48, satisfaction: 4.3 },
];

// Most frequent facility issues
export const facilityIssues = [
  { category: "Furniture", count: 30 },
  { category: "Electrical socket", count: 25 },
  { category: "Bathroom", count: 20 },
  { category: "Ceiling fan", count: 10 },
];

export interface StudentComplaint {
  complaintId: string;
  facility: string;
  assignedTo: string;
  rating: number; // out of 5
  comment: string;
  openedAt: string;
  closedAt?: string;
}

export const studentComplaints: StudentComplaint[] = [
  {
    complaintId: "TASK20001",
    facility: "Ceiling Fan",
    assignedTo: "Kevin Goh",
    rating: 5,
    comment: "Resolved very quickly!",
    openedAt: "2025-10-20 10:30:00",
    closedAt: "2025-10-21 14:00:00",
  },
  {
    complaintId: "TASK20002",
    facility: "Furniture",
    assignedTo: "Stebby Loh",
    rating: 4,
    comment: "Good service.",
    openedAt: "2025-10-22 09:15:00",
    closedAt: "2025-10-23 11:45:00",
  },
  {
    complaintId: "TASK20003",
    facility: "Bathroom",
    assignedTo: "Alicia Lee",
    rating: 3,
    comment: "Took longer than expected.",
    openedAt: "2025-10-23 13:00:00",
    closedAt: "2025-10-25 15:30:00",
  },
  {
    complaintId: "TASK20004",
    facility: "Electrical Socket",
    assignedTo: "Kevin Goh",
    rating: 5,
    comment: "Excellent response!",
    openedAt: "2025-10-24 08:45:00",
    closedAt: "2025-10-24 12:20:00",
  },
];

// Student-facing summary dataset (Complaint ID, Facility Category, Date Submitted, Status)
export interface StudentSummary {
  complaintId: string;
  facilityCategory: string;
  dateSubmitted: string; // ISO or readable date string
  status: "Pending" | "In Progress" | "Resolved" | string;
  location: string;
  roomNumber: string;
  feedbackSubmitted: number|null; // null = not submitted, 0 = no, 1 = yes
  feedbackStars: number|null;
  feedbackComment: string|null;
}

export const studentSummaryData: StudentSummary[] = [
  {
    complaintId: "TASK10001",
    facilityCategory: "Ceiling Fan",
    dateSubmitted: "2025-11-01",
    status: "Pending",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: null,
    feedbackStars: null,
    feedbackComment: null,
  },
  {
    complaintId: "TASK10002",
    facilityCategory: "Bathroom",
    dateSubmitted: "2025-10-28",
    status: "In Progress",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: null,
    feedbackStars: null,
    feedbackComment: null,
  },
  {
    complaintId: "TASK10003",
    facilityCategory: "Electrical Socket",
    dateSubmitted: "2025-10-25",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 0,
    feedbackStars: null,
    feedbackComment: null,
  },
  {
    complaintId: "TASK10004",
    facilityCategory: "Ceiling Fan",
    dateSubmitted: "2025-10-20",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 4,
    feedbackComment: "The staff was quick and professional.",
  },
  {
    complaintId: "TASK10005",
    facilityCategory: "Bathroom",
    dateSubmitted: "2025-10-18",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 5,
    feedbackComment: "Excellent service and resolved quickly!",
  },
  {
    complaintId: "TASK10006",
    facilityCategory: "Electrical Socket",
    dateSubmitted: "2025-10-16",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 0,
    feedbackStars: null,
    feedbackComment: null,
  },
  {
    complaintId: "TASK10007",
    facilityCategory: "Furniture",
    dateSubmitted: "2025-10-14",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 3,
    feedbackComment: "It took a bit long but finally fixed.",
  },
  {
    complaintId: "TASK10008",
    facilityCategory: "Bathroom",
    dateSubmitted: "2025-10-12",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 4,
    feedbackComment: "Good service and very polite staff.",
  },
  {
    complaintId: "TASK10009",
    facilityCategory: "Ceiling Fan",
    dateSubmitted: "2025-10-10",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 5,
    feedbackComment: "Super fast response, very happy!",
  },
  {
    complaintId: "TASK100010",
    facilityCategory: "Electrical Socket",
    dateSubmitted: "2025-10-08",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 4,
    feedbackComment: "Satisfactory service.",
  },
  {
    complaintId: "TASK100011",
    facilityCategory: "Furniture",
    dateSubmitted: "2025-10-05",
    status: "Resolved",
    location: "M06",
    roomNumber: "01-7A",
    feedbackSubmitted: 1,
    feedbackStars: 5,
    feedbackComment: "Excellent work and very professional!",
  },
];


// Holidays for the student-facing banner
export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  image?: string; // optional background image URL for themed banner
  description?: string;
}

export const holidays: Holiday[] = [
  {
    date: "2025-12-25",
    name: "Christmas",
    image: "https://t3.ftcdn.net/jpg/02/98/25/92/240_F_298259257_5lXdLjs950Xo4Vh6kxy0iuwaJ4DhIMXE.jpg",
    description: "Christmas celebration",
  },
  {
    date: "2026-01-01",
    name: "New Year's Day",
    image: "https://static.vecteezy.com/system/resources/previews/071/012/427/non_2x/happy-new-year-2026-sale-banner-vector.jpg",
    description: "Start of the new year",
  },
  {
    date: "2026-2-1, 2026-2-2",
    name: "Thaipusam",
    image: "https://staging.sitegiant.my/wp-content/uploads/2025/02/Thaipusam_announcement_Long_Banner.png",
    description: "Hindu festival of devotion and penance",
  },
  {
    date: "2026-2-17, 2026-2-18",
    name: "Chinese New Year",
    image: "https://t4.ftcdn.net/jpg/04/76/01/77/360_F_476017799_YPUfcPSvV4bDcuMo751P93nZVoSqFXvC.jpg",
    description: "Lunar new year of togetherness and prosperity",
  },
  {
    date: "2026-2-21, 2026-2-22",
    name: "Hari Raya Aidilfitri",
    image: "https://png.pngtree.com/thumb_back/fh260/background/20210417/pngtree-banner-selamat-hari-raya-aidilfitri-vector-background-design-green-gradient-image_632505.jpg",
    description: "Festival marking end of Ramadan",
  },
];

// Current staff availability/status to display in the dashboard
export const staffAvailability = {
  name: "Maintenance Team",
  status: "Available",
  // statusType can be: 'available' | 'out-of-office' | 'unavailable' | 'after office hours'
  statusType: "available",
  note: "On duty until 17:00",
  updatedAt: "2025-11-08 09:00",
};
