import axios from 'axios';
import { FINANCY_ENDPOINT_URL } from '../../config';
import helpers from '../navigation/helpers';
import { ERROR_MESSAGES } from '../navigation/constants';

const { ErrorHelper } = helpers;

// Debug log to ensure ErrorHelper is imported correctly
if (__DEV__) {
  console.log('NetworkUtils: ErrorHelper imported:', !!ErrorHelper);
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: FINANCY_ENDPOINT_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and logging
apiClient.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => {
    ErrorHelper.logError(error, 'API_REQUEST_ERROR');
    return Promise.reject(error);
  },
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  error => {
    const errorMessage = getErrorMessage(error);

    // Enhanced error logging for debugging
    if (__DEV__) {
      console.error('API Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        isNetworkError: !error.response,
      });
    }

    ErrorHelper.logError(
      error,
      `API_RESPONSE_ERROR: ${error.config?.method} ${error.config?.url}`,
    );

    // Transform axios error to our standard format
    const transformedError = {
      ...error,
      message: errorMessage,
      isNetworkError: !error.response,
      statusCode: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(transformedError);
  },
);

// Helper function to get user-friendly error messages
const getErrorMessage = error => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.PERMISSION_DENIED;
    case 404:
      return 'Requested resource not found.';
    case 409:
      return data?.message || 'Resource already exists.';
    case 422:
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    case 503:
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    default:
      return data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Helper function to create authorization headers
const getAuthHeaders = accessToken => {
  if (__DEV__) {
    console.log(
      'Auth token provided:',
      !!accessToken,
      accessToken ? 'Token present' : 'No token',
    );
  }

  if (!accessToken) {
    console.warn('No access token provided for API request');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

// Helper function to handle API responses consistently
const handleApiResponse = async (apiCall, operation = 'API_OPERATION') => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
      status: response.status,
      error: null,
    };
  } catch (error) {
    ErrorHelper.logError(error, operation);
    return {
      success: false,
      data: null,
      status: error.statusCode || 500,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      isNetworkError: error.isNetworkError || false,
    };
  }
};

/**
 * Authentication API calls
 */
export const handleUserSignup = async credentials => {
  return handleApiResponse(
    () => apiClient.post('/auth/register', credentials),
    'USER_SIGNUP',
  );
};

export const handleUserLogin = async credentials => {
  return handleApiResponse(
    () => apiClient.post('/auth/login', credentials),
    'USER_LOGIN',
  );
};

export const getOwnerDetails = async credentials => {
  if (__DEV__) {
    console.log('getOwnerDetails called with credentials:', {
      id: credentials?.id,
      hasToken: !!credentials?.token,
      hasAccessToken: !!credentials?.accessToken,
      keys: Object.keys(credentials || {}),
    });
  }

  return handleApiResponse(
    () =>
      apiClient.get(`/users/${credentials.id}`, {
        headers: getAuthHeaders(credentials.token || credentials.accessToken),
      }),
    'GET_OWNER_DETAILS',
  );
};

/**
 * Analytics API calls
 */
export const analyticsDashBoard = async (accessToken, startDate, endDate) => {
  let endpoint = '/analytics/dashboard';

  if (startDate && endDate) {
    endpoint += `?startDate=${startDate}&endDate=${endDate}`;
  }

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'ANALYTICS_DASHBOARD',
  );
};

export const analyticsPerformance = async (accessToken, startDate, endDate) => {
  let endpoint = '/analytics/performance';

  if (startDate && endDate) {
    endpoint += `?startDate=${startDate}&endDate=${endDate}`;
  }

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'ANALYTICS_PERFORMANCE',
  );
};

/**
 * Room Management API calls
 */
export const propertyRooms = async (accessToken, propertyId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/properties/${propertyId}/rooms`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_PROPERTY_ROOMS',
  );
};

export const createRoom = async (accessToken, propertyId, roomData) => {
  return handleApiResponse(
    () =>
      apiClient.post(`/properties/${propertyId}/rooms`, roomData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_ROOM',
  );
};

export const updateRoom = async (accessToken, propertyId, roomId, roomData) => {
  return handleApiResponse(
    () =>
      apiClient.put(`/properties/${propertyId}/rooms/${roomId}`, roomData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_ROOM',
  );
};

export const deleteRoom = async (accessToken, propertyId, roomId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/properties/${propertyId}/rooms/${roomId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_ROOM',
  );
};

/**
 * Tenant Management API calls
 */
export const addTenant = async (accessToken, propertyId, tenantData) => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/tenants',
        {
          ...tenantData,
          propertyId: propertyId,
        },
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'ADD_TENANT',
  );
};

export const fetchTenants = async (accessToken, propertyId) => {
  return handleApiResponse(
    () =>
      apiClient.get('/tenants', {
        headers: getAuthHeaders(accessToken),
        params: {
          propertyId: propertyId.toString(),
        },
      }),
    'FETCH_TENANTS',
  );
};

export const getTenants = async (accessToken, propertyId, roomId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/tenants/property/${propertyId}/room/${roomId}`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': propertyId,
        },
      }),
    'GET_TENANTS_BY_ROOM',
  );
};

export const putTenantOnNotice = async (accessToken, tenantId, noticeData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/tenants/${tenantId}/notice`, noticeData, {
        headers: getAuthHeaders(accessToken),
      }),
    'PUT_TENANT_ON_NOTICE',
  );
};

export const deleteTenant = async (accessToken, tenantId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/tenants/${tenantId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_TENANT',
  );
};

export const getDocument = async (accessToken, propertyId, documentId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/documents/${documentId}`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': propertyId,
        },
      }),
    'GET_DOCUMENT',
  );
};

/**
 * Ticket Management API calls
 */
export const createTicket = async (accessToken, ticketData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/tickets', ticketData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_TICKET',
  );
};

export const fetchTickets = async (accessToken, propertyId) => {
  return handleApiResponse(
    () =>
      apiClient.get('/tickets', {
        headers: getAuthHeaders(accessToken),
        params: {
          propertyId: propertyId.toString(),
        },
      }),
    'FETCH_TICKETS',
  );
};

export const updateTicketStatus = async (accessToken, ticketId, status) => {
  return handleApiResponse(
    () =>
      apiClient.patch(
        `/tickets/${ticketId}/status`,
        { status },
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'UPDATE_TICKET_STATUS',
  );
};

export const deleteTicket = async (accessToken, ticketId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/tickets/${ticketId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_TICKET',
  );
};

/**
 * Document Management API calls
 */
export const uploadDocument = async (accessToken, documentData) => {
  const formData = new FormData();
  Object.keys(documentData).forEach(key => {
    formData.append(key, documentData[key]);
  });

  return handleApiResponse(
    () =>
      apiClient.post('/documents', formData, {
        headers: {
          ...getAuthHeaders(accessToken),
          'Content-Type': 'multipart/form-data',
        },
      }),
    'UPLOAD_DOCUMENT',
  );
};

export const fetchDocuments = async (accessToken, entityType, entityId) => {
  return handleApiResponse(
    () =>
      apiClient.get('/documents', {
        headers: getAuthHeaders(accessToken),
        params: {
          entityType,
          entityId: entityId.toString(),
        },
      }),
    'FETCH_DOCUMENTS',
  );
};

export const deleteDocument = async (accessToken, documentId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/documents/${documentId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_DOCUMENT',
  );
};

export const createDocument = async (accessToken, propertyId, documentData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/documents', documentData, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': propertyId,
        },
      }),
    'CREATE_DOCUMENT',
  );
};

export const updateDocument = async (
  accessToken,
  propertyId,
  documentId,
  documentData,
) => {
  return handleApiResponse(
    () =>
      apiClient.put(`/documents/${documentId}`, documentData, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': propertyId,
        },
      }),
    'UPDATE_DOCUMENT',
  );
};

export const updateTicket = async (accessToken, ticketId, ticketData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/tickets/${ticketId}`, ticketData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_TICKET',
  );
};

/**
 * File Upload Helper for S3
 */
export const uploadToS3 = async (uploadUrl, file) => {
  try {
    // Fetch the file as a blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload to S3 using fetch
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `Failed to upload file to S3: ${uploadResponse.statusText}`,
      );
    }

    return {
      success: true,
      status: uploadResponse.status,
      message: 'File uploaded successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to upload file',
    };
  }
};
