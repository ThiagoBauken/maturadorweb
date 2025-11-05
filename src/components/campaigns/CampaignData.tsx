
export const campaignData = [
  {
    id: "1",
    name: 'Welcome Series',
    status: 'active',
    progress: 45,
    recipients: 1500,
    sent: 675,
    delivered: 650,
    read: 430,
    replied: 120,
    createdAt: '2023-06-15',
    description: 'Automated welcome messages for new customers',
    message: 'Hello and welcome to our service! We are thrilled to have you onboard.',
    recipientList: ['+1234567890', '+0987654321']
  },
  {
    id: "2",
    name: 'Monthly Newsletter',
    status: 'paused',
    progress: 32,
    recipients: 3200,
    sent: 1024,
    delivered: 1000,
    read: 750,
    replied: 85,
    createdAt: '2023-06-10',
    description: 'Monthly product updates and announcements',
    message: 'Here are this month\'s updates and exciting announcements from our team!',
    recipientList: ['+1122334455', '+5566778899']
  },
  {
    id: "3",
    name: 'Product Announcement',
    status: 'draft',
    progress: 0,
    recipients: 2500,
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    createdAt: '2023-06-20',
    description: 'New product launch announcement',
    message: 'We\'re excited to announce our newest product launch! Check it out now.',
    recipientList: []
  },
  {
    id: "4",
    name: 'Spring Promotion',
    status: 'completed',
    progress: 100,
    recipients: 1800,
    sent: 1800,
    delivered: 1760,
    read: 1450,
    replied: 310,
    createdAt: '2023-05-28',
    description: 'Spring season promotional offers',
    message: 'Spring is here! Enjoy our special seasonal discounts on all products.',
    recipientList: ['+1212121212', '+3434343434']
  },
  {
    id: "5",
    name: 'Customer Feedback',
    status: 'active',
    progress: 78,
    recipients: 1200,
    sent: 936,
    delivered: 920,
    read: 810,
    replied: 290,
    createdAt: '2023-06-18',
    description: 'Request for customer feedback survey',
    message: 'We value your opinion! Please take a moment to complete our short survey.',
    recipientList: ['+5656565656', '+7878787878']
  },
];

export interface Campaign {
  id: string;
  name: string;
  status: string;
  progress: number;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  createdAt: string;
  description?: string;
  message?: string;
  recipientList?: string[];
}
