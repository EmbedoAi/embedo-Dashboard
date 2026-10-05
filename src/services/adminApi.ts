// Public interface for all admin data access. Pages and hooks should import
// only from this file, never from mockAdapter/mockStore directly — that way,
// swapping in a real backend later is a matter of writing an httpAdapter.ts
// with the same shape and changing the import below.
import * as mockAdapter from './mockAdapter'

const adapter = mockAdapter

export const adminApi = {
  login: adapter.login,
  logout: adapter.logout,
  getSession: adapter.getSession,
  listUsers: adapter.listUsers,
  getUser: adapter.getUser,
  getUserCreditHistory: adapter.getUserCreditHistory,
  approveUser: adapter.approveUser,
  suspendUser: adapter.suspendUser,
  reactivateUser: adapter.reactivateUser,
  listDiagrams: adapter.listDiagrams,
  getDiagram: adapter.getDiagram,
  getAnalyticsSummary: adapter.getAnalyticsSummary,
  listApiKeys: adapter.listApiKeys,
  toggleApiKeyStatus: adapter.toggleApiKeyStatus,
  getAiUsageSummary: adapter.getAiUsageSummary,
}
