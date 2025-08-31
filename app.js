// first iteration:
// 1) add elements
// 2) remove elements
// 3) mark elements as done

//referencer til html-elementer
const addTaskField = document.querySelector(".add-task-field");
const addTaskBtn = document.querySelector(".add-task-btn");
const taskList = document.querySelector(".task-list");

// funktion der står for at lave en task
function createTask() {
  {
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

      // slet knap
      let deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.classList.add("fa", "fa-trash");
      deleteBtn.addEventListener("click", () => {
        task.remove();
      });

      // markér som fuldført knap
      let markAsDone = document.createElement("input");
      markAsDone.type = "checkbox";

      // event listener til når checkboxens status ændres (checked/unchecked)
      markAsDone.addEventListener("change", () => {
        if (markAsDone.checked == true) {
          // tilføj streg igennem teksten
          taskText.innerHTML = `<s>${userInput}</s>`;
          taskText.classList.remove("unfinished");
          taskText.classList.add("finished");
        } else {
          // fjern streg igennem teksten
          taskText.innerHTML = userInput;
          taskText.classList.remove("finished");
          taskText.classList.add("unfinished");
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
      });
    } else {
      alert("Please input a value");
    }
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
