import mongoose from "mongoose";


const TaskSchema = new mongoose.Schema({
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
    title: {
        type: String,
    },
    
    description: {
        type: String,

    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM','HIGH'],
        default: 'LOW'
    },
    dueDate: {

    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

});

const TaskModel = mongoose.model('Task', TaskSchema)


export default TaskModel