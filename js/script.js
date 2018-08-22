var axiosInstance = axios.create({
    baseURL: 'http://localhost:9000',
});

getTaskList();

$('#formSubmit').click(e => {
    e.preventDefault();

    var taskId = $(e.currentTarget.form).attr('task-id');
    var name = $('.name').val();
    var description = $('.description').val();
    var dueDate = $('.due-date').val();
    var completedAt = $('.completed-at').val();
    if (taskId) {
        updateTask(taskId, name, description, dueDate, completedAt)
    } else {
        addTask(name, description, dueDate, completedAt);
    }
});

$('#all').click(e => {
    e.preventDefault();
    getTaskList();
})

$('#overdue').click(e => {
    e.preventDefault();
    getTaskList("overdue");
});

$('#complete').click(e => {
    e.preventDefault();
    getTaskList("completed");
});

function deleteTask(id) {
    axiosInstance.delete(`/task/${id}`)
        .then(response => {
            getTaskList()
        })
        .catch(error => console.log(error))
}

function updateTasks(taskPromise) {
    var tasksTable = $('#tasksTable')[0];
    // clear everything besides the header
    $('#tasksTable').find("tr:gt(0)").remove();

    taskPromise
        .then(response => {
            for (var i = 0; i < response.data.length; i++) {
                addRow(tasksTable, response.data[i]);
            }
            $('.delete-btn').click(e => {
                e.stopImmediatePropagation();
                e.preventDefault();
                var id = $(e.currentTarget.parentElement).parent().attr('task-id')
                deleteTask(id);
            });
            $('.task-row').click(e => {
                var id = $(e.currentTarget).attr('task-id');
                var name = $(e.currentTarget).find('.name-column').text();
                var description = $(e.currentTarget).find('.description-column').text();
                var dueDate = $(e.currentTarget).find('.due-date-column').text();
                var completedAt = $(e.curerntTarget).find('.completed-at').text();

                $('#taskForm').attr('task-id', id);

                $('.current-task').text(`Task Id: ${id}`);
                $('#nameInput').val(name);
                $('#descriptionInput').val(description);
                $('#dueDateInput').val(dueDate);
                $('#completedAtInput').val(completedAt);
            });
        })
        .catch(error => console.log(error));
}

function getTaskList(filterType) {
    switch(filterType) {
        case "all":
            updateTasks(axiosInstance.get('/task'));
            break;
        case "overdue":
            updateTasks(axiosInstance.get('/task?overdue=true'));
            break;
        case "completed":
            updateTasks(axiosInstance.get('/task?completed=true'));
            break;
         default:
            updateTasks(axiosInstance.get('/task'));
    }
}

function addTask(name, description, dueDate, completedAt) {
    axiosInstance.post('/task', {
        name,
        description,
        due_date: dueDate,
        completed_at: completedAt
    })
    .then(_ => {
        // reload the table after it was succuessfully submitted
        getTaskList();
    })
    .catch(error => console.log(error))
}

function updateTask(id, name, description, dueDate, completedAt) {
    axiosInstance.put(`/task/${id}`, {
        name,
        description,
        due_date: dueDate,
        completed_at: completedAt
    })
    .then(response => {
        getTaskList();
    })
    .catch(error => console.log(error))
}

function addRow(table, data) {
    var newRow = table.insertRow(table.rows.length);
    newRow.className = 'task-row'
    newRow.setAttribute("task-id", data.id)

    var nameCell = newRow.insertCell(0);
    nameCell.className = "name-column"

    var descriptionCell = newRow.insertCell(1);
    descriptionCell.className = "description-column"

    var dueDateCell = newRow.insertCell(2);
    dueDateCell.className = "due-date-column"

    var completedAtCell = newRow.insertCell(3);
    completedAtCell.className = "completed-at-column"

    var deleteCell = newRow.insertCell(4);
    deleteCell.className = "delete-column"

    var completed_at = "Not completed yet"
    if (data.completed_at !== null) {
        completed_at = data.completed_at
    }

    nameCell.appendChild(document.createTextNode(data.name));
    descriptionCell.appendChild(document.createTextNode(data.description))
    dueDateCell.appendChild(document.createTextNode(data.due_date));
    completedAtCell.appendChild(document.createTextNode(completed_at));

    deleteCell.innerHTML = '<button class="delete-btn">Delete</button>'
}