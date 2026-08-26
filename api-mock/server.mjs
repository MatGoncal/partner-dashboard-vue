/**
 * AcmePay v1 mock API for partner-dashboard-vue.
 * Implements shared contract endpoints with integer minor units (no float money).
 */

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.MOCK_API_PORT ?? 8787);
const DEMO_API_KEY = 'demo-partner-key';

/** @type {Record<string, object>} */
const payments = {};

/** @type {Record<string, object>} */
const quotes = {};

const balances = {
  balances: [
    { currency: 'BRL', available: 50000, pending: 1500 },
    { currency: 'USD', available: 2000, pending: 0 },
    { currency: 'EUR', available: 850, pending: 120 },
  ],
};

const FX_RATES = {
  BRL_USD: '0.18500000',
  BRL_EUR: '0.17100000',
  USD_BRL: '5.42000000',
  EUR_BRL: '5.85000000',
};

function isoNow() {
  return new Date().toISOString();
}

function isoFuture(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function authOk(req) {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const apiKey = req.headers['x-api-key'];
  const key = bearer || apiKey;
  return key === DEMO_API_KEY;
}


function json(res, payload, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function seedPayments() {
  const samples = [
    { amount: 1500, status: 'PAID', external_id: 'order-101', description: 'Checkout order 101' },
    { amount: 3200, status: 'PENDING', external_id: 'order-102', description: 'PIX charge #102' },
    { amount: 8900, status: 'PAID', external_id: 'order-103', description: 'Subscription renewal' },
    { amount: 500, status: 'EXPIRED', external_id: 'order-104', description: 'Expired QR test' },
    { amount: 12500, status: 'PENDING', external_id: 'order-105', description: 'Bulk invoice' },
    { amount: 750, status: 'FAILED', external_id: 'order-106', description: 'Failed settlement' },
    { amount: 2100, status: 'PAID', external_id: 'order-107', description: 'Marketplace split' },
    { amount: 4400, status: 'CANCELLED', external_id: 'order-108', description: 'Cancelled by partner' },
  ];

  for (const sample of samples) {
    const id = randomUUID();
    const created = isoNow();
    payments[id] = {
      id,
      status: sample.status,
      amount: sample.amount,
      currency: 'BRL',
      external_id: sample.external_id,
      description: sample.description,
      qr_code: `00020126acmepay${id.slice(0, 8)}`,
      copy_paste: `00020126acmepay${id.slice(0, 8)}`,
      expires_at: isoFuture(1800),
      created_at: created,
      paid_at: sample.status === 'PAID' ? isoNow() : undefined,
    };
  }
}

seedPayments();

function listPayments(query) {
  const status = query.get('status');
  const externalId = query.get('external_id');
  const page = Math.max(1, Number(query.get('page') ?? 1));
  const perPage = Math.min(50, Math.max(1, Number(query.get('per_page') ?? 10)));

  let items = Object.values(payments).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (status) {
    items = items.filter((p) => p.status === status.toUpperCase());
  }
  if (externalId) {
    items = items.filter((p) => String(p.external_id).includes(externalId));
  }

  const total = items.length;
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);

  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage) || 1,
    },
  };
}

function computeTargetAmount(sourceAmount, rateStr) {
  const rateParts = rateStr.split('.');
  const rateInt = Number(rateParts[0] ?? 0);
  const rateFrac = (rateParts[1] ?? '').padEnd(8, '0').slice(0, 8);
  const scale = 10 ** 8;
  const rateScaled = rateInt * scale + Number(rateFrac);
  return Math.round((sourceAmount * rateScaled) / scale);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname;
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    });
    res.end();
    return;
  }

  if (method === 'GET' && path === '/health') {
    json(res, { status: 'ok', service: 'acmepay-mock' });
    return;
  }

  const needsAuth =
    path.startsWith('/v1/') &&
    path !== '/v1/webhooks/payment';

  if (needsAuth && !authOk(req)) {
    json(res, { message: 'Unauthorized' }, 401);
    return;
  }

  if (method === 'GET' && path === '/v1/payments') {
    json(res, listPayments(url.searchParams));
    return;
  }

  if (method === 'POST' && path === '/v1/payments') {
    const body = await readBody(req);
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      json(res, { message: 'amount must be a positive integer (minor units)' }, 422);
      return;
    }

    const id = randomUUID();
    const expiresIn = Number(body.expires_in_seconds ?? 1800);
    const payment = {
      id,
      status: 'PENDING',
      amount,
      currency: body.currency ?? 'BRL',
      external_id: body.external_id ?? null,
      description: body.description ?? null,
      qr_code: `00020126acmepay${id.replace(/-/g, '').slice(0, 16)}`,
      copy_paste: `00020126acmepay${id.replace(/-/g, '').slice(0, 16)}`,
      expires_at: isoFuture(expiresIn),
      created_at: isoNow(),
    };
    payments[id] = payment;

    // Demo: auto-PAID after 8s for polling UX
    setTimeout(() => {
      if (payments[id]?.status === 'PENDING') {
        payments[id].status = 'PAID';
        payments[id].paid_at = isoNow();
        balances.balances[0].available += amount;
        balances.balances[0].pending = Math.max(0, balances.balances[0].pending - amount);
      }
    }, 8000);

    json(res, payment, 201);
    return;
  }

  const paymentMatch = path.match(/^\/v1\/payments\/([^/]+)$/);
  if (method === 'GET' && paymentMatch) {
    const payment = payments[paymentMatch[1]];
    if (!payment) {
      json(res, { message: 'Not found' }, 404);
      return;
    }
    json(res, payment);
    return;
  }

  if (method === 'POST' && path === '/v1/fx/quotes') {
    const body = await readBody(req);
    const source = String(body.source_currency ?? 'BRL').toUpperCase();
    const target = String(body.target_currency ?? 'USD').toUpperCase();
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      json(res, { message: 'amount must be positive integer minor units' }, 422);
      return;
    }

    const rateKey = `${source}_${target}`;
    const rate = FX_RATES[rateKey];
    if (!rate) {
      json(res, { message: 'FX pair not supported in mock' }, 422);
      return;
    }

    const quoteId = randomUUID();
    const quote = {
      quote_id: quoteId,
      source_currency: source,
      target_currency: target,
      source_amount: amount,
      target_amount: computeTargetAmount(amount, rate),
      rate,
      expires_at: isoFuture(300),
      created_at: isoNow(),
    };
    quotes[quoteId] = quote;
    json(res, quote, 201);
    return;
  }

  if (method === 'GET' && path === '/v1/balances') {
    json(res, balances);
    return;
  }

  json(res, { message: 'Not found', path }, 404);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use. Try MOCK_API_PORT=8788 npm run api`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`AcmePay mock API on http://localhost:${PORT}`);
  console.log(`Demo API key: ${DEMO_API_KEY}`);
});
