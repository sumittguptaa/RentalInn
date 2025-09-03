import axios from 'axios';
import {FINANCY_ENDPOINT_URL} from '../../config';

export const handleUserSignup = async credentials => {
  const url = `${FINANCY_ENDPOINT_URL}/auth/register`;
  const signup_res = await axios.post(url, credentials);

  return signup_res.data;
};

export const handleUserLogin = async credentials => {
  const url = `${FINANCY_ENDPOINT_URL}/auth/login`;

  const login_res = await axios.post(url, credentials);

  return login_res.data;
};

export const getOwnerDetails = async credentials => {
  const url = `${FINANCY_ENDPOINT_URL}/users/${credentials.id}`;

  const owner_res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
    },
  });

  return owner_res.data;
};

export const analyticsDashBoard = (accessToken, startDate, endDate) => {
  let url = `${FINANCY_ENDPOINT_URL}/analytics/dashboard`;

  if (!!startDate && !!endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const analytics_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return analytics_res;
};

export const analyticsPerformance = (accessToken, startDate, endDate) => {
  let url = `${FINANCY_ENDPOINT_URL}/analytics/performance`;

  if (!!startDate && !!endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const performance_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return performance_res;
};

export const propertyRooms = (accessToken, propertyId) => {
  const url = `${FINANCY_ENDPOINT_URL}/properties/${propertyId}/rooms`;

  const rooms_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return rooms_res;
};

export const createRoom = async (accessToken, propertyId, roomData) => {
  const url = `${FINANCY_ENDPOINT_URL}/properties/${propertyId}/rooms`;

  const create_room_res = await axios.post(url, roomData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return create_room_res;
};

export const updateRoom = (accessToken, propertyId, roomId, roomData) => {
  const url = `${FINANCY_ENDPOINT_URL}/properties/${propertyId}/rooms/${roomId}`;

  const update_room_res = axios.put(url, roomData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return update_room_res;
};

export const deleteRoom = (accessToken, propertyId, roomId) => {
  const url = `${FINANCY_ENDPOINT_URL}/properties/${propertyId}/rooms/${roomId}`;

  const delete_room_res = axios.delete(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return delete_room_res;
};

export const addTenant = (accessToken, propertyId, tenantData) => {
  const url = `${FINANCY_ENDPOINT_URL}/tenants`;

  const add_tenant_res = axios.post(
    url,
    {...tenantData, propertyId: propertyId},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return add_tenant_res;
};

export const fetchTenants = (accessToken, propertyId) => {
  const url = `${FINANCY_ENDPOINT_URL}/tenants`;

  const tenants_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      propertyId: propertyId.toString(),
    },
  });

  return tenants_res;
};

export const createTicket = (accessToken, ticketData) => {
  const url = `${FINANCY_ENDPOINT_URL}/tickets`;

  const create_ticket_res = axios.post(url, ticketData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return create_ticket_res;
};

export const fetchTickets = (accessToken, propertyId) => {
  const url = `${FINANCY_ENDPOINT_URL}/tickets?propertyId=${propertyId}`;

  const tickets_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return tickets_res;
};

export const updateTicket = (accessToken, ticketId, ticketData) => {
  const url = `${FINANCY_ENDPOINT_URL}/tickets/${ticketId}`;

  const update_ticket_res = axios.patch(url, ticketData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return update_ticket_res;
};

export const createDocument = (accessToken, property_id, documentData) => {
  const url = `${FINANCY_ENDPOINT_URL}/documents`;

  const create_document_res = axios.post(url, documentData, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': property_id,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return create_document_res;
};

export const updateDocument = (
  accessToken,
  property_id,
  documentId,
  documentData,
) => {
  const url = `${FINANCY_ENDPOINT_URL}/documents/${documentId}`;

  const update_document_res = axios.put(url, documentData, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': property_id,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return update_document_res;
};

export const deleteDocument = (accessToken, property_id, documentId) => {
  const url = `${FINANCY_ENDPOINT_URL}/documents/${documentId}`;

  const delete_document_res = axios.delete(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': property_id,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return delete_document_res;
};

export const fetchDocuments = (accessToken, property_id, propertyId) => {
  const url = `${FINANCY_ENDPOINT_URL}/documents`;

  const documents_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': property_id,
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      propertyId: propertyId.toString(),
    },
  });

  return documents_res;
};

export const uploadDocument = async (upload_url, file) => {
  // Fetch the file as a blob
  const response = await fetch(file.uri);
  const blob = await response.blob();

  // Upload to S3 using fetch
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to S3');
  }

  return uploadResponse;
};

export const getDocument = (accessToken, propertyId, documentId) => {
  const url = `${FINANCY_ENDPOINT_URL}/documents/${documentId}`;

  const document_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': propertyId,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return document_res;
};

export const getTenants = (accessToken, propertyId, roomId) => {
  const url = `${FINANCY_ENDPOINT_URL}/tenants/property/${propertyId}/room/${roomId}`;

  const tenants_res = axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': propertyId,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return tenants_res;
};

export const putTenantOnNotice = (accessToken, tenantId, noticeData) => {
  const url = `${FINANCY_ENDPOINT_URL}/tenants/${tenantId}/notice`;

  const put_notice_res = axios.patch(url, noticeData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return put_notice_res;
};

export const deleteTenant = (accessToken, tenantId) => {
  const url = `${FINANCY_ENDPOINT_URL}/tenants/${tenantId}`;

  const delete_tenant_res = axios.delete(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return delete_tenant_res;
};
