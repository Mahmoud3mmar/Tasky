import { Router } from "express";
import { authenticate, authorize, checkBlacklist } from "../../Auth/middlewares/auth.middleware.js";
import { AddTask, DeleteTask, GetAllTasks, GetTask, UpdateTask } from "../Controllers/Task.Controller.js";
import { upload } from "../../../MiddleWares/Upload.middleware.js";

const router=Router()






router.post(('/'),authenticate,checkBlacklist,upload.single("image"),AddTask)
router.get(('/Filter'),authenticate,checkBlacklist,GetAllTasks)
router.get(('/:id'),authenticate,checkBlacklist,GetTask)

router.put(('/:id'),authenticate,checkBlacklist,UpdateTask)
router.delete(('/:id'),authenticate,checkBlacklist,DeleteTask)

export default router