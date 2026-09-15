export interface WebhookPreset {
  id: string;
  name: string;
  endpoint: string;
  payload: Record<string, any>;
}

export const webhookPresets: WebhookPreset[] = [
  {
    id: 'stripe_invoice',
    name: 'Stripe — Invoice Payment Succeeded',
    endpoint: '/api/v1/webhooks/stripe',
    payload: {
      id: 'evt_3MtwadLkdIwHu7ix28a3tqPa',
      object: 'event',
      type: 'invoice.payment_succeeded',
      created: 1679001200,
      data: {
        object: {
          id: 'in_1MtwadLkdIwHu7ix28a3tqPa',
          customer: 'cus_9941a8b',
          customer_email: 'finance@acmecorp.com',
          customer_name: 'Acme Corporation Inc.',
          amount_paid: 499900,
          currency: 'usd',
          status: 'paid',
          subscription: 'sub_12941094',
        },
      },
    },
  },
  {
    id: 'github_push',
    name: 'GitHub — Repository Push Event',
    endpoint: '/api/v1/webhooks/github',
    payload: {
      ref: 'refs/heads/main',
      before: '6113728f27ae82c7b1a12fce0d338e9a2b761774',
      after: '883cae6a9950ac7fad9e6839d625c67843b9c0bc',
      repository: {
        name: 'fastflow-engine',
        full_name: 'org/fastflow-engine',
        owner: {
          name: 'octocat',
          email: 'octocat@github.com',
        },
      },
      commits: [
        {
          id: '883cae6a9950ac7fad9e6839d625c67843b9c0bc',
          message: 'feat: add dag auto-layout and breakpoint debugger',
          author: {
            name: 'Alexander Motologa',
            email: 'dev@fastflow.io',
          },
        },
      ],
    },
  },
  {
    id: 'shopify_order',
    name: 'Shopify — Order Created',
    endpoint: '/api/v1/webhooks/shopify/orders-create',
    payload: {
      id: 8209829119461,
      email: 'alex.shopper@gmail.com',
      total_price: '349.50',
      currency: 'USD',
      financial_status: 'paid',
      customer: {
        first_name: 'Alex',
        last_name: 'Shopper',
        email: 'alex.shopper@gmail.com',
        orders_count: 3,
      },
      line_items: [
        {
          id: 7030735049885,
          title: 'Quantum Ergonomic Keyboard',
          quantity: 1,
          price: '299.00',
        },
        {
          id: 7030735049886,
          title: 'Magnetic Cable System',
          quantity: 1,
          price: '50.50',
        },
      ],
    },
  },
  {
    id: 'hubspot_contact',
    name: 'HubSpot — Contact Lifecycle Stage Updated',
    endpoint: '/api/v1/webhooks/hubspot/contact',
    payload: {
      portalId: 684201,
      objectType: 'CONTACT',
      objectId: 1849102,
      properties: {
        email: { value: 'vp_eng@hyperion-systems.net' },
        firstname: { value: 'Evelyn' },
        lastname: { value: 'Cross' },
        company: { value: 'Hyperion Systems' },
        lifecyclestage: { value: 'salesqualifiedlead' },
        lead_score: { value: 92 },
      },
    },
  },
];

export const WEBHOOK_PRESETS = webhookPresets;

