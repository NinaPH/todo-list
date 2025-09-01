// first iteration:
// 1) add elements
// 2) remove elements
// 3) mark elements as done

// localStorage.removeItem("tasks");

//referencer til html-elementer
const addTaskField = document.querySelector(".add-task-field");
const addTaskBtn = document.querySelector(".add-task-btn");
const taskList = document.querySelector(".task-list");

//array som bliver fyldt med de objekter, der repræsenterer tasks
let tasksArray = [];

function loadTasks() {
  // hent tasks fra JSON-fil og konvertér dem om til data/et objekt
  const savedTasks = JSON.parse(localStorage.getItem("tasks"));
  //afslut funktionen hvis arrayet er tomt
  if (!savedTasks) return;

  //for hver entry i savedTasks, byg alle <li>-elementerne ud fra objektet
  savedTasks.forEach((taskObj) => {
    if (!taskObj) return;
    let task = document.createElement("li");
    task.id = "task";
    task.draggable = "true";

    let taskText = document.createElement("span");
    taskText.textContent = taskObj.text;
    taskText.classList.add("task-text");
    if (taskObj.done) {
      taskText.classList.add("finished");
      taskText.innerHTML = `<s>${taskObj.text}</s>`;
    } else {
      taskText.classList.add("unfinished");
    }

    let markAsDone = document.createElement("input");
    markAsDone.type = "checkbox";
    markAsDone.checked = taskObj.done;
    markAsDone.dataset.id = taskObj.id;

    markAsDone.addEventListener("change", () => {
      if (markAsDone.checked) {
        taskText.innerHTML = `<s>${taskObj.text}</s>`;
        taskText.classList.remove("unfinished");
        taskText.classList.add("finished");
        taskObj.done = true;
      } else {
        taskText.innerHTML = taskObj.text;
        taskText.classList.remove("finished");
        taskText.classList.add("unfinished");
        taskObj.done = false;
      }
      saveTasks();
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn", "fa", "fa-trash");
    deleteBtn.addEventListener("click", () => {
      task.remove();
      tasksArray = tasksArray.filter((t) => t.id !== taskObj.id);
      saveTasks();
    });

    task.appendChild(markAsDone);
    task.appendChild(taskText);
    task.appendChild(deleteBtn);
    taskList.appendChild(task);

    task.addEventListener("dragstart", (e) => {
      setTimeout(() => {
        task.classList.add("dragging");
        task.style.opacity = 0.3;
        e.dataTransfer.setDragImage(task, 0, 0);
      }, 0);
    });
    task.addEventListener("dragend", () => {
      task.classList.remove("dragging");
      task.style.opacity = 1;

      // opdater rækkefølgen i arrayet
      const newOrder = [...taskList.querySelectorAll("li")].map((li) =>
        tasksArray.find(
          (t) => t.id === Number(li.querySelector("input").dataset.id)
        )
      );
      tasksArray = newOrder;
      saveTasks();
    });
    tasksArray.push(taskObj);
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

// funktion der står for at lave en task
function createTask() {
  // gem input i variabel
  let userInput = addTaskField.value;
  if (userInput) {
    // task er det overordnede li-element
    let task = document.createElement("li");
    task.id = "task";
    // gør elementet flytbart med musen
    task.draggable = "true";

    // en span indeni li-elementet der refererer til task teksten
    let taskText = document.createElement("span");
    taskText.textContent = userInput;
    taskText.classList.add("task-text");

    let taskObj = {
      text: taskText.textContent,
      done: taskText.classList.contains("finished") ? true : false,
      id: Date.now(),
    };

    // slet knap
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.classList.add("fa", "fa-trash");
    deleteBtn.addEventListener("click", () => {
      task.remove();
      tasksArray = tasksArray.filter((t) => t.id !== taskObj.id); // fjern fra arrayet
      saveTasks();
    });

    // markér som fuldført knap
    let markAsDone = document.createElement("input");
    markAsDone.type = "checkbox";
    markAsDone.dataset.id = taskObj.id;

    // event listener til når checkboxens status ændres (checked/unchecked)
    markAsDone.addEventListener("change", () => {
      let id = Number(markAsDone.dataset.id);
      let task = tasksArray.find((t) => t.id === id);
      if (markAsDone.checked) {
        // tilføj streg igennem teksten
        taskText.innerHTML = `<s>${userInput}</s>`;
        taskText.classList.remove("unfinished");
        taskText.classList.add("finished");
        task.done = true;
        saveTasks();
      } else {
        // fjern streg igennem teksten
        taskText.innerHTML = userInput;
        taskText.classList.remove("finished");
        taskText.classList.add("unfinished");
        task.done = false;
        saveTasks();
      }
    });

    // append underelementerne til "task", og append "task" til "taskList"
    task.appendChild(markAsDone);
    task.appendChild(taskText);
    task.appendChild(deleteBtn);
    taskList.appendChild(task);
    // tøm feltet i interfacet
    addTaskField.value = "";

    // event listener der udføres lige når man begynder at dragge elementet
    task.addEventListener("dragstart", (e) => {
      //setTimeout forsinker koden en smule
      setTimeout(() => {
        //tilføj dragging class for styling + identifikation
        task.classList.add("dragging");
        // tilføj midlrtidig opacity styling
        task.style.opacity = 0.3;
        // giver browseren et billede af selve tasken, der følger musen under drag. Offset er 0,0
        e.dataTransfer.setDragImage(task, 0, 0);
      }, 0);
    });

    // sker når man slipper musen og stopper med at dragge
    task.addEventListener("dragend", () => {
      // fjerne dragging class og resette opacity
      task.classList.remove("dragging");
      task.style.opacity = 1;

      const newOrder = [...taskList.querySelectorAll("li")].map((li) => {
        return tasksArray.find(
          (task) => task.id === Number(li.querySelector("input").dataset.id)
        );
      });
      tasksArray = newOrder;
      saveTasks();
    });

    tasksArray.push(taskObj);
    saveTasks();
  } else {
    alert("Please input a value");
  }
}

// håndterer selve flytningen af todo-elementer
function initSortableList(e) {
  e.preventDefault();
  // finder det element der er i gang med at blive dragged vha. classen
  const draggingItem = taskList.querySelector(".dragging");
  // liste over alle andre <li>-elementer
  const siblings = [...taskList.querySelectorAll("li:not(.dragging)")];

  // finder det første element i listen, hvor musens Y-position er over halvdelen af elementets højde - hvilket betyder “træk elementet før denne”
  let nextSibling = siblings.find((sibling) => {
    return e.clientY < sibling.offsetTop + sibling.offsetHeight / 2;
  });

  // hvis vi fandt elementet, indsætter vi det trukne element før det.
  if (nextSibling) {
    taskList.insertBefore(draggingItem, nextSibling);
  } else {
    // hvis ikke, betyder det, at vi trækker det nederst, så vi tilføjer det til slutningen {
    taskList.appendChild(draggingItem);
  }
}

loadTasks();

// event listeners når "tilføj"-knappen klikkes eller der trykkes enter
addTaskBtn.addEventListener("click", createTask);
addTaskField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    createTask();
  }
});

// sker løbende mens der dragges over containeren
// bruges til at finde ud af, hvor i listen elementet skal placeres
taskList.addEventListener("dragover", initSortableList);

// browseren tillader kun drop hvis man forhindrer standardadfærden
taskList.addEventListener("dragenter", (e) => e.preventDefault());
