// ═══════════════════════════════════════════
// DineSmart OS — Restaurant Controller
// ═══════════════════════════════════════════
import * as restaurantService from './restaurant.service.js';
import { updateRestaurantSchema, createBranchSchema, updateBranchSchema, createTableSchema, updateTableSchema, createUserSchema, updateUserSchema } from '@dinesmart/shared';
export async function getProfile(req, res) {
    const data = await restaurantService.getProfile(req.user.restaurantId);
    res.json({ success: true, data });
}
export async function updateProfile(req, res) {
    const body = updateRestaurantSchema.parse(req.body);
    const data = await restaurantService.updateProfile(req.user.restaurantId, body);
    res.json({ success: true, data });
}
export async function getBranches(req, res) {
    const data = await restaurantService.getBranches(req.user.restaurantId);
    res.json({ success: true, data });
}
export async function createBranch(req, res) {
    const body = createBranchSchema.parse(req.body);
    const data = await restaurantService.createBranch(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateBranch(req, res) {
    const body = updateBranchSchema.parse(req.body);
    const data = await restaurantService.updateBranch(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteBranch(req, res) {
    await restaurantService.deleteBranch(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'Branch deleted' } });
}
export async function getTables(req, res) {
    const branchId = req.query['branchId'];
    const data = await restaurantService.getTables(req.user.restaurantId, branchId);
    res.json({ success: true, data });
}
export async function createTable(req, res) {
    const body = createTableSchema.parse(req.body);
    const data = await restaurantService.createTable(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateTable(req, res) {
    const body = updateTableSchema.parse(req.body);
    const data = await restaurantService.updateTable(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteTable(req, res) {
    await restaurantService.deleteTable(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'Table deleted' } });
}
export async function getTableQR(req, res) {
    const buffer = await restaurantService.getTableQR(req.user.restaurantId, req.params['id'], req);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
}
export async function getUsers(req, res) {
    const data = await restaurantService.getUsers(req.user.restaurantId);
    res.json({ success: true, data });
}
export async function createUser(req, res) {
    const body = createUserSchema.parse(req.body);
    const data = await restaurantService.createUser(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateUser(req, res) {
    const body = updateUserSchema.parse(req.body);
    const data = await restaurantService.updateUser(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteUser(req, res) {
    await restaurantService.deleteUser(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'User deleted' } });
}
//# sourceMappingURL=restaurant.controller.js.map