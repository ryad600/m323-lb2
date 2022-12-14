import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, p, h1, table, tr, td, input } = hh(h);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
const containerStyle = "container mx-auto my-8 max-w-md";
const inputContainerStyle = "flex items-center mt-4";
const inputStyle = "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500";
const flashcardTableStyle = "mt-4 text-left px-[100%]";

const MSGS = {
  ADD_FLASHCARD: "ADD_FLASHCARD",
  DELETE_FLASHCARD: "DELETE_FLASHCARD",
  RATE_FLASHCARD: "RATE_FLASHCARD",
};

// Define the flashcard model
function Flashcard(question, answer, rating) {
  this.question = question;
  this.answer = answer;
  this.rating = rating;
}

// Define the function to sort flashcards
function sortFlashcards(flashcards) {
  flashcards.sort((a, b) => b.rating - a.rating);
  return flashcards;
}

// Define a function to get the values from the form inputs
function getFormValues(formId, inputIds) {
  const form = document.getElementById(formId);
  return inputIds.map((id) => form[id].value);
}

function view(dispatch, model) {
  return div({ className: containerStyle }, [
    h1({ className: "text-2xl" }, `Flashcard Learning App`),
    form({ id: "flashcard-form" }, [
      div({ className: inputContainerStyle }, [
        input({ className: inputStyle, type: "text", placeholder: "Question", id: "flashcard-question" }),
        input({ className: inputStyle, type: "text", placeholder: "Answer", id: "flashcard-answer" }),
        button({ className: btnStyle, onclick: () => dispatch(MSGS.ADD_FLASHCARD) }, "Add Flashcard"),
      ]),
    ]),
    table({ className: flashcardTableStyle }, [
      ...model.flashcards.map((flashcard, index) => {
        return tr({ key: index }, [
          td({}, flashcard.question),
          td({}, flashcard.answer),
          td({}, button({
            className: btnStyle,
            onclick: () => dispatch(MSGS.RATE_FLASHCARD, { index, rating: "bad" }),}, "Bad")
            ),
            td({}, button({
              className: btnStyle,
              onclick: () => dispatch(MSGS.RATE_FLASHCARD, { index, rating: "ok" }),}, "Ok")
            ),
            td({}, button({
              className: btnStyle,
              onclick: () => dispatch(MSGS.RATE_FLASHCARD, { index, rating: "good" }),}, "Good")
            ),
            td({}, button({
              className: btnStyle,
              onclick: () => dispatch(MSGS.DELETE_FLASHCARD, { index }),}, "Delete")
            ),
          ]);
        }),
      ]),
    ]);
  }
  
  function update(msg, model) {
    switch (msg) {
      case MSGS.ADD_FLASHCARD:
        const [question, answer] = getFormValues("flashcard-form", ["flashcard-question", "flashcard-answer"]);
        return {
          ...model,
          flashcards: [...model.flashcards, new Flashcard(question, answer, 0)],
        };
      case MSGS.RATE_FLASHCARD:
        const { index, rating } = msg;
        let newRating;
        if (rating === "bad") {
          newRating = 1;
        } else if (rating === "ok") {
          newRating = 2;
        } else if (rating === "good") {
          newRating = 3;
        }
        const updatedFlashcard = new Flashcard(model.flashcards[index].question, model.flashcards[index].answer, newRating);
        return {
          ...model,
          flashcards: sortFlashcards([...model.flashcards.slice(0, index), updatedFlashcard, ...model.flashcards.slice(index + 1)]),
        };
      case MSGS.DELETE_FLASHCARD:
        const { index } = msg;
        return {
          ...model,
          flashcards: sortFlashcards([...model.flashcards.slice(0, index), ...model.flashcards.slice(index + 1)]),
        };
      default:
        return model;
    }
  }
  
  function app(initModel, update, view, node) {
    let model = initModel;
    let currentView = view(dispatch, model);
    let rootNode = createElement(currentView);
    node.appendChild(rootNode);
    function dispatch(msg) {
      model = update(msg, model);
      const updatedView = view(dispatch, model);
      const patches = diff(currentView, updatedView);
      rootNode = patch(rootNode, patches);
      currentView = updatedView;
    }
  }
  
  const rootNode = document.getElementById("app");
  const initialModel = { flashcards: [] };

app(initialModel, update, view, rootNode);

  
