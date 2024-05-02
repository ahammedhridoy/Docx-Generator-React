import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import { useState } from "react";

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

function App() {
  const [questions, setQuestions] = useState(
    Array(5).fill({ question: "", answer: "", solution: "" })
  );

  const handleCheckboxChange = (index, e) => {
    const { nextSibling } = e.target;
    const paragraph = nextSibling;

    if (paragraph && paragraph.nodeName === "P") {
      const { innerText } = paragraph;
      const answerParagraph = paragraph.nextSibling;
      const solutionParagraph = answerParagraph.nextSibling;

      if (
        answerParagraph &&
        answerParagraph.nodeName === "P" &&
        solutionParagraph &&
        solutionParagraph.nodeName === "P"
      ) {
        const answer = answerParagraph.innerText;
        const solution = solutionParagraph.innerText;
        setQuestions((prevState) => {
          const updatedQuestions = [...prevState];
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            question: innerText,
            answer,
            solution,
          };
          return updatedQuestions;
        });
      } else {
        console.error("Answer or solution value not found");
      }
    } else {
      console.error("Question value not found");
    }
  };

  const generateDocument = () => {
    loadFile("/template.docx", function (error, content) {
      if (error) {
        throw error;
      }
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Replace dynamic values with user input
      const data = questions.reduce((acc, curr, index) => {
        acc[`question${index + 1}`] = curr.question;
        acc[`answer${index + 1}`] = curr.answer;
        acc[`solution${index + 1}`] = curr.solution;
        return acc;
      }, {});

      doc.setData(data);
      doc.render();

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      saveAs(out, "output.docx");
    });
  };

  return (
    <>
      <div className="app flex justify-center items-center min-h-[100vh] ">
        <div className="content w-[90%] md:w-[60%]">
          <div className="shadow-xl card w-100 bg-base-100">
            <div className="card-body">
              {/* Questions */}
              {questions.map((q, index) => (
                <div key={index} className="collapse collapse-plus bg-base-200">
                  <input type="checkbox" name={`my-accordion-${index + 1}`} />
                  <div className="min-h-0 text-xl font-medium collapse-title">
                    Question {index + 1}
                  </div>

                  <div className="collapse-content">
                    <p>Select</p>
                    <input
                      type="checkbox"
                      className="mb-5 border-blue-500 checkbox"
                      onChange={(e) => handleCheckboxChange(index, e)}
                    />
                    <p className="my-3 text-lg question">
                      <div className="w-auto chat-bubble">
                        <p>What is 2+2?</p>
                      </div>
                    </p>
                    <p className="my-3 text-lg question">
                      <div className="w-auto chat-bubble">
                        <p>a) Is It 4?</p>
                        <p>b) Is It 6?</p>
                      </div>
                    </p>
                    <p className="my-3 text-lg question">
                      <div className="w-auto chat-bubble">
                        <p>2+2 is 4</p>
                      </div>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="mt-5 text-center text-white btn btn-accent"
            onClick={generateDocument}
          >
            Generate DOCX
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
