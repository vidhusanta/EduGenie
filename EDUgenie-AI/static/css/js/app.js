// ===============================
// Elements
// ===============================

const task =
    document.getElementById("task");

const level =
    document.getElementById("level");

const levelLabel =
    document.getElementById("level-label");

const input =
    document.getElementById("inputText");

const inputLabel =
    document.getElementById("input-label");

const submitBtn =
    document.getElementById("submitBtn");

const status =
    document.getElementById("status");

const resultCard =
    document.getElementById("resultCard");

const result =
    document.getElementById("result");


// ===============================
// Task Information
// ===============================

const taskInfo = {

    qa: {

        label: "Your Question",

        placeholder:
            "Example: Which is the largest ocean?",

        button:
            "Ask EduGenie"
    },


    explain: {

        label: "Topic to Explain",

        placeholder:
            "Example: Explain photosynthesis for a beginner.",

        button:
            "Explain Topic"
    },


    quiz: {

        label:
            "Topic or Educational Passage",

        placeholder:
            "Paste a topic or educational passage to generate 3 MCQs.",

        button:
            "Generate Quiz"
    },


    summarize: {

        label:
            "Text to Summarize",

        placeholder:
            "Paste a long educational passage here.",

        button:
            "Summarize"
    },


    learn: {

        label:
            "Topic to Learn",

        placeholder:
            "Example: SQL",

        button:
            "Build Learning Path"
    }

};


// ===============================
// Update Form
// ===============================

function updateForm() {

    const info =
        taskInfo[task.value];


    inputLabel.textContent =
        info.label;


    input.placeholder =
        info.placeholder;


    submitBtn.textContent =
        info.button;


    const isLearning =
        task.value === "learn";


    level.classList.toggle(
        "hidden",
        !isLearning
    );


    levelLabel.classList.toggle(
        "hidden",
        !isLearning
    );
}


task.addEventListener(
    "change",
    updateForm
);


updateForm();


// ===============================
// Escape HTML
// ===============================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// ===============================
// Render Quiz
// ===============================

function renderQuiz(
    questions
) {

    result.innerHTML =
        questions
            .map(
                (question, index) => `

                <div class="quiz-question">

                    <strong>
                        ${index + 1}.
                        ${escapeHtml(
                            question.question
                        )}
                    </strong>

                    ${question.options
                        .map(
                            option => `

                            <button
                                class="quiz-option"
                                data-answer="${escapeHtml(
                                    question.correct_answer
                                )}"
                                data-option="${escapeHtml(
                                    option
                                )}"
                            >
                                ${escapeHtml(
                                    option
                                )}
                            </button>

                        `
                        )
                        .join("")}

                    <p class="quiz-feedback"></p>

                </div>

            `
            )
            .join("");


    document
        .querySelectorAll(
            ".quiz-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const parent =
                            button.closest(
                                ".quiz-question"
                            );


                        const isCorrect =
                            button.dataset.answer ===
                            button.dataset.option;


                        parent
                            .querySelectorAll(
                                ".quiz-option"
                            )
                            .forEach(
                                option => {
                                    option.disabled =
                                        true;
                                }
                            );


                        button.classList.add(
                            isCorrect
                                ? "correct"
                                : "wrong"
                        );


                        const feedback =
                            parent.querySelector(
                                ".quiz-feedback"
                            );


                        feedback.textContent =
                            isCorrect
                                ? "Correct!"
                                : `Correct answer: ${button.dataset.answer}`;
                    }
                );

            }
        );
}


// ===============================
// Submit
// ===============================

async function submit() {

    const text =
        input.value.trim();


    if (!text) {

        status.textContent =
            "Please enter some text first.";

        return;
    }


    submitBtn.disabled =
        true;


    status.textContent =
        "EduGenie is thinking...";


    resultCard.classList.add(
        "hidden"
    );


    let url;

    let body;


    // -------------------------------
    // Q&A
    // -------------------------------

    if (
        task.value === "qa"
    ) {

        url = "/qa";

        body = {
            question: text
        };

    }


    // -------------------------------
    // Explanation
    // -------------------------------

    else if (
        task.value === "explain"
    ) {

        url = "/explain";

        body = {
            text: text
        };

    }


    // -------------------------------
    // Quiz
    // -------------------------------

    else if (
        task.value === "quiz"
    ) {

        url = "/quiz";

        body = {
            text: text
        };

    }


    // -------------------------------
    // Summary
    // -------------------------------

    else if (
        task.value === "summarize"
    ) {

        url = "/summarize";

        body = {
            text: text
        };

    }


    // -------------------------------
    // Learning Path
    // -------------------------------

    else {

        url =
            "/learn/recommendations";

        body = {

            topic: text,

            level:
                level.value
        };
    }


    try {

        const response =
            await fetch(
                url,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(body)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Request failed."
            );
        }


        // -------------------------------
        // Quiz result
        // -------------------------------

        if (
            task.value === "quiz"
        ) {

            renderQuiz(
                data.quiz
            );

        }


        // -------------------------------
        // Text result
        // -------------------------------

        else {

            const value =
                data.answer ||
                data.explanation ||
                data.summary ||
                data.recommendations;


            result.innerHTML =
                `
                <div class="result">
                    ${escapeHtml(value)}
                </div>
                `;
        }


        resultCard.classList.remove(
            "hidden"
        );


        status.textContent =
            "Done.";

    }


    catch (error) {

        result.innerHTML =
            `
            <div class="result">
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;


        resultCard.classList.remove(
            "hidden"
        );


        status.textContent =
            "Something went wrong.";
    }


    finally {

        submitBtn.disabled =
            false;
    }
}


// ===============================
// Button Event
// ===============================

submitBtn.addEventListener(
    "click",
    submit
);


// ===============================
// Ctrl + Enter
// ===============================

input.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            submit();
        }
    }
);