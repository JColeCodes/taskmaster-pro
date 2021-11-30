var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Edit task on click
$(".list-group").on("click", "p", function() {
  // Find text of clicked upon p
  var text = $(this)
    .text()
    .trim();

  // Make new textarea and add the text into it
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // Replace p with textarea and focus on it
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});
// Revert to p when clicked off and save edited task
$(".list-group").on("blur", "textarea", function() {
  // Get textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // Get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // Get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // Updates text
  tasks[status][index].text = text;
  saveTasks();

  // Recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // Replace textarea with p
  $(this).replaceWith(taskP);
});

// Edit due date on click
$(".list-group").on("click", "span", function() {
  // Get current text
  var date = $(this)
    .text()
    .trim();
  
  // Create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // Swap out elements
  $(this).replaceWith(dateInput);
  // Automatically focus on new element
  dateInput.trigger("focus");
});
// Value of date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // Get current text
  var date = $(this)
    .val()
    .trim();

  // Get the parent's ul id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // Update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // Recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // Replace input with span element
  $(this).replaceWith(taskSpan);
});

// Sort tasks
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerace: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  update: function(event) {
    var tempArr = [];
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text: text,
        date: date
      });
    });
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    tasks[arrName] = tempArr;
    saveTasks();
    console.log(tempArr);
  }
});

// Drop and delete tasks
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


