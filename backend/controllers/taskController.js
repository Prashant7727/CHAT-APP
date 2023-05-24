const Task = require("../models/taskModel");
const axios = require("axios");

//add task
const addTask = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Assuming the user ID is available in the request after authentication
    const taskData = req.body;
    taskData.createdBy = loggedInUserId; // Set the createdBy field with the user ID
    const task = new Task(taskData);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create the task" });
  }
};

//completed task.
const completeTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = 5; // Set status to "Completed"
    const completedTask = await task.save();

    res.status(200).json(completedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to complete the task" });
  }
};

//getTask
const getTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId).sort({ createdAt: -1 });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task data" });
  }
};

//getTaskData by createdBy or responsible or participant or observers in Descending order
const getTaskData = async (req, res) => {
  try {
    // Check if the user is logged in
    const loggedInUserId = req.user._id; // Assuming the user ID is available in the request after authentication
    console.log(loggedInUserId);
    // Find the tasks associated with the logged-in user
    const tasks = await Task.find({
      $or: [
        { createdBy: loggedInUserId },
        { responsible: loggedInUserId },
        { participant: loggedInUserId },
        { observers: loggedInUserId },
      ],
    }).sort({ createdAt: -1 });

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found for the user" });
    }

    // Return the task data in the response
    res.json({
      status: 200,
      message: "success",
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve task data" });
  }
};

//getTask by status
const getTaskByStatus = async (req, res) => {
  try {
    // Check if the user is logged in
    const loggedInUserId = req.user._id; // Assuming the user ID is available in the request after authentication

    const { status } = req.params; // Assuming the status is provided as a query parameter

    // Find the tasks associated with the logged-in user and matching status
    const tasks = await Task.find({
      $or: [
        { createdBy: loggedInUserId },
        { responsible: loggedInUserId },
        { participant: loggedInUserId },
        { observers: loggedInUserId },
      ],
      status: status, // Filter tasks based on the provided status
    }).sort({ createdAt: -1 });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found with the given status" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task data" });
  }
};

// const getTaskByStatus = async (req, res) => {
//   const status = req.params.status;

//   try {
//     const tasks = await Task.find({ status: status });

//     if (tasks.length === 0) {
//       return res.status(404).json({ error: "No tasks found with the given status" });
//     }

//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to retrieve task data" });
//   }
// };

//gettingTaskData for 30days
const getTaskDataLast30Days = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log(loggedInUserId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasks = await Task.find({
      $or: [
        { createdBy: loggedInUserId },
        { responsible: loggedInUserId },
        { participant: loggedInUserId },
        { observers: loggedInUserId },
      ],
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found within the last 30 days" });
    }

    res.json({
      status: 200,
      message: "success",
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve task data", details: error.message });
  }
};
const getTaskDataLast7Days = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log(loggedInUserId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 7);

    const tasks = await Task.find({
      $or: [
        { createdBy: loggedInUserId },
        { responsible: loggedInUserId },
        { participant: loggedInUserId },
        { observers: loggedInUserId },
      ],
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found within the last 30 days" });
    }

    res.json({
      status: 200,
      message: "success",
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve task data", details: error.message });
  }
};

const getTaskByRole = async (req, res) => {
  const { createdBy, responsible, participant, observers } = req.query;
  try {
    if (!createdBy && !responsible && !participant && !observers) {
      return res.status(400).json({ error: "err" });
    }

    const query = {};

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (responsible) {
      query.responsible = responsible;
    }

    if (participant) {
      query.participant = participant;
    }

    if (observers) {
      query.observers = observers;
    }

    const tasks = await Task.find(query);

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task data" });
  }
};

//pause task
const pauseTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = 2; // Set status to "Pending"
    const pausedTask = await task.save();

    res.status(200).json(pausedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to pause the task" });
  }
};

//renew a task
const renewTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = 2; // Set status to "Pending"
    task.closedTask = 0; // Reset closedTask to 0
    task.closedOn = null; // Reset closedOn to null
    const renewedTask = await task.save();

    res.status(200).json(renewedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to renew the task" });
  }
};

//Add comment Task
const addResultFromComment = async (req, res) => {
  const taskId = req.params.taskId;
  const comment = req.body.comment;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.results.push(comment); // Add the comment to the task's results array
    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add result from comment to the task" });
  }
};

//Start Task:-

const startTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = 3; // Se t status to "In Progress"
    const progressTask = await task.save();

    res.status(200).json(progressTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to pause the task" });
  }
};

//Update Task

const updateTask = async (req, res) => {
  const taskId = req.params.taskId;
  const updates = req.body;

  try {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

module.exports = {
  addTask,
  completeTask,
  getTask,
  getTaskData,
  getTaskByStatus,
  getTaskDataLast30Days,
  getTaskDataLast7Days,
  getTaskByRole,
  pauseTask,
  renewTask,
  addResultFromComment,
  startTask,
  updateTask,
};
