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
  addTaskField.classList.remove("missing-input");
  //afslut funktionen hvis arrayet er tomt
  if (!savedTasks) return;

  //for hver entry i savedTasks, byg alle <li>-elementerne ud fra objektet
  savedTasks.forEach((taskObj) => {
    if (!taskObj) return;
    let task = document.createElement("li");
    task.classList.add("task");
    task.draggable = "true";

    let taskText = document.createElement("span");
    taskText.textContent = taskObj.text;
    taskText.classList.add("task-text");
    if (taskObj.done) {
      task.classList.add("finished");
    } else {
      taskText.classList.add("unfinished");
    }

    let markAsDone = document.createElement("input");
    markAsDone.type = "checkbox";
    markAsDone.classList.add("checkbox");
    markAsDone.checked = taskObj.done;
    markAsDone.dataset.id = taskObj.id;

    markAsDone.addEventListener("change", () => {
      if (markAsDone.checked) {
        task.classList.add("finished");
        taskObj.done = true;
      } else {
        taskText.innerHTML = taskObj.text;
        task.classList.remove("finished");
        taskObj.done = false;
      }
      saveTasks();
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    // slet-knap event listener
    deleteBtn.addEventListener("click", () => {
      // sæt max-height til elementets aktuelle højde først
      task.style.maxHeight = task.offsetHeight + "px";

      // trigger transition
      requestAnimationFrame(() => {
        task.classList.add("removing");

        setTimeout(() => {
          task.remove();
          tasksArray = tasksArray.filter((t) => t.id !== taskObj.id);
          saveTasks();
        }, 200); // duration = CSS transition
      });
    });

    task.appendChild(markAsDone);
    task.appendChild(taskText);
    task.appendChild(deleteBtn);
    taskList.appendChild(task);

    task.addEventListener("dragstart", (e) => {
      setTimeout(() => {
        task.classList.add("dragging");
        e.dataTransfer.setDragImage(task, 0, 0);
      }, 0);
    });
    task.addEventListener("dragend", () => {
      task.classList.remove("dragging");

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

addTaskField.addEventListener("click", () =>
  addTaskField.classList.remove("missing-input")
);

// funktion der står for at lave en task
function createTask() {
  // gem input i variabel
  let userInput = addTaskField.value;
  if (userInput) {
    addTaskField.classList.remove("missing-input");
    // task er det overordnede li-element
    let task = document.createElement("li");
    task.classList.add("task");
    // gør elementet flytbart med musen
    task.draggable = "true";

    // en span indeni li-elementet der refererer til task teksten
    let taskText = document.createElement("span");
    taskText.textContent = userInput;
    taskText.classList.add("task-text");

    let taskObj = {
      text: taskText.textContent,
      done: false,
      id: Date.now(),
    };

    // slet knap
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    // slet-knap event listener
    deleteBtn.addEventListener("click", () => {
      // sæt max-height til elementets aktuelle højde først
      task.style.maxHeight = task.offsetHeight + "px";

      // trigger transition
      requestAnimationFrame(() => {
        task.classList.add("removing");

        setTimeout(() => {
          task.remove();
          tasksArray = tasksArray.filter((t) => t.id !== taskObj.id);
          saveTasks();
        }, 200); // duration = CSS transition
      });
    });

    // markér som fuldført knap
    let markAsDone = document.createElement("input");
    markAsDone.type = "checkbox";
    markAsDone.classList.add("checkbox");
    markAsDone.dataset.id = taskObj.id;
    markAsDone.checked = taskObj.done;

    // event listener til når checkboxens status ændres (checked/unchecked)
    markAsDone.addEventListener("change", () => {
      let id = Number(markAsDone.dataset.id);
      let taskObj = tasksArray.find((t) => t.id === id);
      if (markAsDone.checked) {
        // tilføj streg igennem teksten
        task.classList.add("finished");
        taskObj.done = true;
        saveTasks();
      } else {
        // fjern streg igennem teksten
        taskText.innerHTML = userInput;
        task.classList.remove("finished");
        taskObj.done = false;
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
        // giver browseren et billede af selve tasken, der følger musen under drag. Offset er 0,0
        e.dataTransfer.setDragImage(task, 0, 0);
      }, 0);
    });

    // sker når man slipper musen og stopper med at dragge
    task.addEventListener("dragend", () => {
      // fjerne dragging class og resette opacity
      task.classList.remove("dragging");

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
    addTaskField.classList.add("missing-input");
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
    const rect = sibling.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2;
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
