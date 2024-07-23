import { AppError, catchAsyncError } from "../../../utils/error.handler.js";
import imageModel from "../../Image/Models/image.model.js";
import UserModel from "../../User/Models/user.model.js";
import TaskModel from "../Models/Task.Model.js";
import { cloudinary } from "../../../utils/Cloudinary.config.js";



const AddTask = catchAsyncError(async (req, res) => {
    const { title, description, priority, dueDate } = req.body;


    const userId = req.user.id;

    // Validate that required fields are present
    if (!title || !description || !priority || !dueDate) {
        throw new AppError ('All fields are required',400)
    }
        
    // Create the task
    const Task = await TaskModel.create({ title, description, priority, dueDate, user: userId });


        
    // Handle image upload if a file is provided
    if (req.file) {
        const image = await imageModel.create({
            name: req.file.originalname,
            url: req.file.path,
            postedBy: userId,
            task: Task._id,
        });
                
        // Update the task with the new image ID    
        await TaskModel.findByIdAndUpdate(Task._id, { $push: { images: image._id } });
        cloudinary.uploader
            .upload(image.url, {
                use_filename: true
            }
        )

        
        // Update the user document with the new task ID
        await UserModel.findOneAndUpdate(
            { _id: userId }, // Filter by category ID and user ID
            { $push: { tasks: Task._id } },
        );     
    }

    res.status(201).json({ message: 'Task Added successfully ..', Task });
});

const GetAllTasks = catchAsyncError(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const Tasks = await TaskModel.find()
        .skip(skip)
        .limit(parseInt(limit));

    // Count total documents matching the filter criteria for pagination metadata
    const totalTasks = await TaskModel.countDocuments();
    res.status(200).json({
        message: ' Tasks returned successfully',
        Tasks,
        meta: {
            total: totalTasks,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalTasks / limit)
             
        }
    });
});

const GetTask = catchAsyncError(async (req, res) => {

    const TaskId = req.params.id; //  category ID is passed as a parameter


    const Task= await TaskModel.find({_id:TaskId})
    res.status(201).json({ message: 'Task Returned successfully ..', Task })

   
});

const UpdateTask = catchAsyncError(async (req, res) => {
    const TaskId = req.params.id; // Task ID is passed as a parameter
    const userId = req.user.id; //  user ID is extracted from the token

    const { title, description, priority, dueDate } = req.body;

    // Validate that required fields are present
    if (!title || !description || !priority || !dueDate) {
        throw new AppError('All fields are required' ,400)
    }

    const updatedTask = await TaskModel.findOneAndUpdate(
        {_id: TaskId, user: userId }, // Filter by Task ID
        {
            title,
            description,
            priority,
            dueDate
        },
        { new: true } // Return the updated document
    );

    if (!updatedTask) {
        throw new AppError('Task not found' ,404)

    }

    res.status(200).json({ message: 'Task updated successfully', updatedTask });
});

const DeleteTask = catchAsyncError(async (req, res) => {
    const TaskId = req.params.id; // Task ID is passed as a parameter
    const userId = req.user.id; // User ID is extracted from the token

    // Check if the task exists and belongs to the user
    const deletedTask = await TaskModel.findOneAndDelete({ _id: TaskId, user: userId });

    if (!deletedTask) {
        throw new AppError('Task not found or does not belong to the user',404)
    }

    // Remove the task ID from the user's tasks array
    const userUpdateResult = await UserModel.updateOne(
        { _id: userId },
        { $pull: { tasks: TaskId } }
    );

    if (userUpdateResult.nModified === 0) {
        throw new AppError('Failed to update user document', 500);
    }
    res.status(200).json({ message: 'Task deleted successfully', deletedTask });
});







export {
    AddTask,
    GetAllTasks,
    GetTask,
    UpdateTask,
    DeleteTask
}