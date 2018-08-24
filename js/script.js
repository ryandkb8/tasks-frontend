var axiosInstance = axios.create({
    baseURL: 'http://localhost:9000',
});

var ENDPOINTS = {
    ALL: '/task',
    OVERDUE: '/task?overdue=true',
    COMPLETED: '/task?completed=true'
};

var ERRORS = {
    NAME_MISSING: 'Name must be defined',
    DESCRIPTION_MISSING: 'Description must be defined',
    DUE_DATE_MISSING: 'Due date must be defined',
    DUE_DATE_INVALID_FORMAT: 'Due date must be in format YYYY-MM-DD',
    COMPLETED_AT_INVALID_FORMAT: 'Completed at must be in format YYYY-MM-DD'
}

getTaskList();

$('#formSubmit').click(e => {
    e.preventDefault();

    var taskId = $(e.currentTarget.form).attr('task-id');
    var name = $('.name').val();
    var description = $('.description').val();
    var dueDate = $('.due-date').val();
    var completedAt = $('.completed-at').val();

    var errors = [];

    if (!name) {
        errors.push(ERRORS.NAME_MISSING);
    }

    if (!description) {
        errors.push(ERRORS.DESCRIPTION_MISSING);
    }

    if (!dueDate) {
        errors.push(ERRORS.DUE_DATE_MISSING);
    } else if (!moment(dueDate).isValid()) {
        errors.push(ERRORS.DUE_DATE_INVALID_FORMAT);
    }

    if (completedAt && !moment(completedAt).isValid()) {
        errors.push(ERRORS.COMPLETED_AT_INVALID_FORMAT);
    }
    
    var errorsString = errors.join('. ');

    if (errorsString) {
        displayError(errorsString)
    } else {
        if (taskId) {
            updateTask(taskId, name, description, dueDate, completedAt)
        } else {
            addTask(name, description, dueDate, completedAt);
        }
    }
});

$('#all').click(e => {
    e.preventDefault();
    getTaskList();
})

$('#overdue').click(e => {
    e.preventDefault();
    getTaskList(ENDPOINTS.OVERDUE);
});

$('#complete').click(e => {
    e.preventDefault();
    getTaskList(ENDPOINTS.COMPLETED);
});

$('#addTask').click(e => {
    e.preventDefault();

    $('#taskForm').attr('task-id', '');

    $('.current-task').text('New Task');
    $('#nameInput').val('');
    $('#descriptionInput').val('');
    $('#dueDateInput').val('');
    $('#completedAtInput').val('');
})

function displayError(message) {
    $('.error-message').html(message)
    // Display error
    $('.error-message').removeClass('hidden');
    // Remove error message
    setTimeout(() => $('.error-message').addClass('hidden'), 2000);
}

function deleteTask(id) {
    axiosInstance.delete(`/task/${id}`)
        .then(response => {
            getTaskList()
        })
        .catch(error => displayError(error))
}

function getTaskList(endpoint = ENDPOINTS.ALL) {
    axiosInstance.get(endpoint)
        .then(updateTable)
        .catch(error => displayError(error));
}


function updateTable(response) {
    var tasksTable = $('#tasksTable')[0];
    // clear everything besides the header
    $('#tasksTable').find("tr:gt(0)").remove();

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
}


function addTask(name, description, dueDate, completedAt) {
    var body = {
        name,
        description,
        due_date: dueDate
    };

    if (completedAt) {
        body.completed_at = completedAt
    };
    
    axiosInstance.post('/task', body)
    .then(_ => {
        // reload the table after it was succuessfully submitted
        getTaskList();
    })
    .catch(error => displayError(error))
}

function updateTask(id, name, description, dueDate, completedAt) {
    var body = {
        name,
        description,
        due_date: dueDate
    };

    if (completedAt) {
        body.completed_at = completedAt
    };

    axiosInstance.put(`/task/${id}`, body)
    .then(response => {
        getTaskList();
    })
    .catch(error => displayError(error))
}

function addRow(table, data) {
    var taskDueDate = moment(data.due_date, 'YYYY-MM-DD').startOf('day');

    var sameDay = moment().startOf('day').isSame(taskDueDate);
    var nextDay = moment().add(1, 'd').startOf('day').isSame(taskDueDate);

    var newRow = table.insertRow(table.rows.length);
    newRow.className = 'task-row'
    newRow.setAttribute("task-id", data.id)

    var nameCell = newRow.insertCell(0);
    nameCell.className = "name-column"

    var descriptionCell = newRow.insertCell(1);
    descriptionCell.className = "description-column"

    var dueDateCell = newRow.insertCell(2);
    dueDateCell.className = "due-date-column"

    if (sameDay && !data.completed_at) {
        $(newRow).addClass('same-day');
    }

    if (nextDay && !data.completed_at) {
        $(newRow).addClass('next-day');
    }

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
