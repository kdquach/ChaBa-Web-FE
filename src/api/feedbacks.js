import apiClient from "./client";

/**
 * Feedback API module
 * Base path: /feedbacks
 * Endpoints (from BE):
 *  GET    /feedbacks                      query: productId, rating, status, sortBy, limit, page
 *  GET    /feedbacks/:feedbackId          get single feedback
 *  DELETE /feedbacks/:feedbackId          delete feedback (auth required)
 *  GET    /feedbacks/:feedbackId/replies  list replies (pagination)
 *  POST   /feedbacks/:feedbackId/replies  add reply (body: parentId?, content)
 *  PATCH  /feedbacks/:fid/replies/:rid    update reply (body: content)
 *  DELETE /feedbacks/replies/:replyId     delete reply
 */

// -------- FEEDBACKS --------

/**
 * Fetch paginated list of feedbacks
 * @param {Object} params
 * @param {string} [params.productId]
 * @param {number} [params.rating]
 * @param {string} [params.status] approved|rejected|reported
 * @param {string} [params.sortBy]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 */
export const fetchFeedbacks = async (params = {}) => {
	return apiClient.get("/feedbacks", { params });
};

/**
 * Get a single feedback with its details
 * @param {string} feedbackId
 */
export const fetchFeedbackById = async (feedbackId) => {
	return apiClient.get(`/feedbacks/${feedbackId}`);
};

/**
 * Delete a feedback (staff/admin or owner allowed by BE logic)
 * @param {string} feedbackId
 */
export const deleteFeedback = async (feedbackId) => {
	return apiClient.delete(`/feedbacks/${feedbackId}`);
};

// -------- REPLIES --------

/**
 * Fetch replies of a feedback (paginated)
 * @param {string} feedbackId
 * @param {Object} params { page, limit, sortBy }
 */
export const fetchFeedbackReplies = async (feedbackId, params = {}) => {
	return apiClient.get(`/feedbacks/${feedbackId}/replies`, { params });
};

/**
 * Add a reply to a feedback
 * @param {string} feedbackId
 * @param {{ parentId?: string|null, content: string }} data
 */
export const addFeedbackReply = async (feedbackId, data) => {
	return apiClient.post(`/feedbacks/${feedbackId}/replies`, data);
};

/**
 * Update an existing reply
 * @param {string} feedbackId
 * @param {string} replyId
 * @param {{ content: string }} data
 */
export const updateFeedbackReply = async (feedbackId, replyId, data) => {
	return apiClient.patch(`/feedbacks/${feedbackId}/replies/${replyId}`, data);
};

/**
 * Delete a reply by ID
 * @param {string} replyId
 */
export const deleteFeedbackReply = async (replyId) => {
	return apiClient.delete(`/feedbacks/replies/${replyId}`);
};

// Utility to build sort string e.g. rating:desc
export const buildSort = (field, order) => {
	if (!field || !order) return undefined;
	return `${field}:${order === "ascend" ? "asc" : "desc"}`;
};

export default {
	fetchFeedbacks,
	fetchFeedbackById,
	deleteFeedback,
	fetchFeedbackReplies,
	addFeedbackReply,
	updateFeedbackReply,
	deleteFeedbackReply,
	buildSort,
};
