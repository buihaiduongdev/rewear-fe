import { orvalRequest } from './orval-request';

interface MediaUploadTicket {
  id: string;
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
}

export async function uploadPrivateMedia(file: File): Promise<string> {
  const ticketRes = await orvalRequest<{ data: MediaUploadTicket }>({
    url: '/api/media/upload-ticket',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {
      mimeType: file.type,
      sizeBytes: file.size,
      visibility: 'private',
    },
  });
  const ticket = ticketRes.data;
  const putRes = await fetch(ticket.uploadUrl, {
    method: ticket.method,
    headers: ticket.headers,
    body: file,
  });
  if (!putRes.ok) {
    throw new Error('Could not upload file to storage. Please try again.');
  }
  return ticket.id;
}
