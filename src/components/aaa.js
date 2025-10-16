class TaskScheduler {
    constructor(number){
        this.number = number;
        this.taskQueue = [];        //task[]
        this.runningCOunt = 0;
    }
    addTask(task, priority){
        const taskItem = {
            task,
            priority,
            excuted: async () => {
                try {
                    this.runningCOunt++;
                    await task()
                } finally {
                    this.runningCOunt--;
                    testNext();
                }
            }
        } 
        for(let i = 0; i < this.taskQueue; i++){
            if(taskItem.priority < this.taskQueue[i].priority){
                this.taskQueue.splice(i, 0, taskItem);
            }
        }
    };
    //执行下一个
    testNext(){
        const nextTask = this.taskQueue.shift();
        nextTask.excuted();
    }
    run(){
        taskQueue[0].excuted();
    }
}

/*
addTask(task, priority)：添加一个异步任务到调度器中，
task 是一个返回 Promise 的函数，
priority 是该任务的优先级。​
run()：启动调度器，开始执行任务。
*/

const scheduler = new TaskScheduler(2); // 同时最多执行 2 个任务​

// 模拟异步任务​
const createTask = (id, delay) => () => 
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`任务 ${id} 完成`);
    }, delay);
  });

// 添加任务​
scheduler.addTask(createTask(1, 3000), 2); // 任务 1，优先级 2​
scheduler.addTask(createTask(2, 1000), 1); // 任务 2，优先级 1​
scheduler.addTask(createTask(3, 2000), 3); // 任务 3，优先级 3​
scheduler.addTask(createTask(4, 1500), 1); // 任务 4，优先级 1​

// 启动调度器​
scheduler.run();