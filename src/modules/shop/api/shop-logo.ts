import {
  shopLogoControllerConfirm,
  shopLogoControllerTicket,
} from '@/shared/api/query-generated/shop-logo/shop-logo';

export async function uploadShopLogo(shopId: string, file: File) {
  const input = { mimeType: file.type, sizeBytes: file.size };
  const ticket = (await shopLogoControllerTicket(shopId, input)).data;
  const response = await fetch(ticket.uploadUrl, {
    method: ticket.method,
    headers: ticket.headers,
    body: file,
  });
  if (!response.ok)
    throw new Error('Could not upload the logo. Please try again.');
  await shopLogoControllerConfirm(shopId, {
    ...input,
    storageKey: ticket.storageKey,
  });
}
