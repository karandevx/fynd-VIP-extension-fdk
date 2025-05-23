export const campaigns = [
  {
    id: 1,
    name: 'Summer Sale 2024',
    description: 'Special summer discounts for VIP customers',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    status: 'active',
    selectedProducts: [1, 2, 3],
    selectedCustomers: [1, 2],
    discounts: {
      type: 'percentage',
      value: '20',
      freeDelivery: true
    },
    emailTemplate: {
      subject: 'Summer Sale 2024 - Special VIP Offer',
      content: '<p>Dear VIP Customer,</p><p>Enjoy 20% off on selected products this summer!</p>',
      prompt: 'Create a summer sale email for VIP customers'
    }
  },
  {
    id: 2,
    name: 'Holiday Special',
    description: 'Holiday season exclusive offers',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'draft',
    selectedProducts: [2, 3],
    selectedCustomers: [1, 3],
    discounts: {
      type: 'fixed',
      value: '50',
      freeDelivery: false
    },
    emailTemplate: {
      subject: 'Holiday Special - $50 Off',
      content: '<p>Dear Valued Customer,</p><p>Get $50 off on your next purchase!</p>',
      prompt: 'Create a holiday special email'
    }
  },
  {
    id: 3,
    name: 'New Year Launch',
    description: 'New year product launch campaign',
    startDate: '2025-01-01',
    endDate: '2025-01-15',
    status: 'scheduled',
    selectedProducts: [1, 3],
    selectedCustomers: [2, 3],
    discounts: {
      type: 'percentage',
      value: '15',
      freeDelivery: true
    },
    emailTemplate: {
      subject: 'New Year Launch - Special Preview',
      content: '<p>Dear Customer,</p><p>Be the first to see our new year collection!</p>',
      prompt: 'Create a new year launch email'
    }
  }
];

export const campaignStatusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800'
};

