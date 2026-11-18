const DEFAULT_RESERVATION_DURATION_MS = 10 * 60 * 1000;

const configuredDurationMinutes = Number(process.env.INVENTORY_RESERVATION_DURATION_MINUTES);

export const INVENTORY_RESERVATION_DURATION_MS =
  Number.isFinite(configuredDurationMinutes) && configuredDurationMinutes > 0
    ? configuredDurationMinutes * 60 * 1000
    : DEFAULT_RESERVATION_DURATION_MS;

export const getReservationExpiry = (createdAt = new Date()) =>
  new Date(createdAt.getTime() + INVENTORY_RESERVATION_DURATION_MS);
