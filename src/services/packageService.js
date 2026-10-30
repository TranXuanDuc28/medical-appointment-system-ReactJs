import axios from '../axios';

export const getAllPackages = () => {
    return axios.get('/api/packages/all');
};

export const getFeaturedPackages = () => {
    return axios.get('/api/packages/featured');
};

export const getPackageById = (id) => {
    return axios.get(`/api/packages/${id}`);
};

export const searchPackages = (params) => {
    return axios.get('/api/packages/search', { params });
};

export const getFilterOptions = () => {
    return axios.get('/api/packages/filter-options');
};

export const createPackage = (data) => {
    return axios.post('/api/packages/create', data);
};

export const updatePackage = (id, data) => {
    return axios.put(`/api/packages/update/${id}`, data);
};

export const deletePackage = (id) => {
    return axios.delete(`/api/packages/delete/${id}`);
};

export const getPackageBookingSlots = (facilityId, date, doctorId) => {
    return axios.get('/api/packages/booking-slots', {
        params: { facilityId, date, doctorId }
    });
}; 