import React from "react";
import Axios from "axios";

export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resp: [],
      q: "",
      dic: null,
      timeD: 0,
    };
    this.getData = this.getData.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  inputChange(e) {
    this.setState({
      q: e.target.value,
    });
  }

  sendContentToDB = (data) => {
    // data = data[0].substr(0, 30);
    Axios.post("http://localhost:5000/send", {
      data: data,
    }).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  getData() {
    Axios.get("http://localhost:5000/search", {
      params: {
        q: this.state.q,
      },
    }).then(
      (res) => {
        this.setState({
          resp: res?.data,
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  handleFiles(ev) {
    let input = ev.target.files;
    let promises = [];
    for (let i = 0; i < input.length; i++) {
      let promise = new Promise((resolve) => {
        const file = input[i];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result);
      });
      promises.push(promise);
    }

    Promise.all(promises).then((content) => {
      const startTime = Date.now();
      //   let linesArrs = this.splitByLines(content);
      this.sendContentToDB(content);
      /*
      let list = this.generateListOfAllWords(content);
      let sortedList = this.sortByWords(list);
      let dictionary = this.generateDictionary(sortedList);
      const timeDelta = Date.now() - startTime;
      this.showOnHTML(dictionary, timeDelta);

      // show results in console
      console.log(dictionary);
      // download results as file
      this.saveToFile(dictionary);
      */
    });
  }

  splitByLines = (content) => {
    let list = [];

    for (let i = 0; i < content.length; i++) {
      let splittedByLine = content[i].split(/\r?\n/).filter((el) => el !== "");
      list.push({ file: i, lines: splittedByLine });
    }

    return list;
  };

  showOnHTML = (dictionary, timeDelta) => {
    this.setState({
      dic: dictionary.length,
      timeD: timeDelta,
    });
  };

  saveToFile = (dictionary) => {
    var file = new Blob([JSON.stringify(dictionary)], {
      type: "text/plain;charset=utf-8",
    });
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = "dictionary.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  generateListOfAllWords = (content) => {
    let list = [];

    for (let i = 0; i < content.length; i++) {
      let preparationArr = this.getSortedWordsFromContent(content, i);
      // let splittedByLine = content[i].split(/\r?\n/).filter(el => el !== "");
      this.populateList(preparationArr, list, i);
    }
    return list;
  };

  populateList = (preparationArr, list, i) => {
    let firstPopped = preparationArr.pop();
    list.push({ docId: i + 1, frequency: 1, term: firstPopped.term });
    while (preparationArr.length) {
      let popped = preparationArr.pop();
      if (list[list.length - 1].term === popped.term) {
        list[list.length - 1].frequency++;
      } else {
        list.push({ docId: i + 1, frequency: 1, term: popped.term });
      }
    }
  };

  getSortedWordsFromContent = (content, i) => {
    let preparationArr = [];
    const words = content[i].split(
      /\s|\r|,|\.|—|-|\/|\(|\)|:|;|\[|\]|"|'|\?|!|&|\d/
    );
    const filtered = words.filter((el) => el !== ""); // remove spaces
    const sorted = filtered.sort(); //sort //O(nLogn)
    sorted.forEach((word) => {
      preparationArr.push({ docId: i + 1, term: word, frequency: 1 });
    });
    return preparationArr;
  };

  sortByWords = (list) => {
    //O(nLogn)
    return list.sort(function (a, b) {
      if (a.term > b.term) {
        return 1;
      }
      if (a.term < b.term) {
        return -1;
      }
      return 0;
    });
  };

  generateDictionary = (sortedList) => {
    let dict = [];
    let firstPopped = sortedList.pop();
    dict.push({
      docIds: [{ docId: firstPopped.docId, frequency: firstPopped.frequency }],
      term: firstPopped.term,
    });
    while (sortedList.length) {
      let popped = sortedList.pop();
      if (dict[dict.length - 1].term !== popped.term) {
        dict.push({
          term: popped.term,
          docIds: [{ docId: popped.docId, frequency: popped.frequency }],
        });
      } else {
        dict[dict.length - 1].docIds.push({
          docId: popped.docId,
          frequency: popped.frequency,
        });
        dict[dict.length - 1].docIds.sort((a, b) => {
          return a.docId - b.docId;
        }); // JS sorting by object property in array
      }
    }
    return dict.reverse();
  };

  render() {
    return (
      <>
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div>Instructions:</div>
          <div>1. Upload some files via input at the bottom of the page</div>
          <div>2. Enter some text in Google-like form and press Search</div>
          <div>
            Result: You will see search results (if any) right below the button
          </div>
        </div>
        <div
          style={{
            height: "100vh",
            textAlign: "center",
          }}
        >
          <img
            alt="Google"
            height="92"
            src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
            style={{ paddingTop: 109 }}
            width="272"
          ></img>
          <div>
            <input
              type="text"
              onChange={this.inputChange}
              style={{
                borderRadius: 41,
                width: 550,
                height: 40,
                border: "1px solid lightgray",
                margin: 10,
                boxShadow: "1px 1px #dfdfdf",
                outline: "none",
                padding: "0 20px",
              }}
            />
          </div>
          <div>
            <button
              style={{
                border: "none",
                width: 130,
                height: 33,
                borderRadius: 6,
                color: "gray",
              }}
              onClick={this.getData}
            >
              Search
            </button>
          </div>

          {this.state.resp.map((el, ind) => {
            let indx = el.doc.indexOf(this.state.q.split(" ")[0]);
            return (
              <div key={ind} style={{ textAlign: "left" }}>
                <div>File Number: {el.filenum}</div>
                <div>Line Number: {el.linenum}</div>
                <div>Line Text: {el.doc}</div>
                <br></br>
              </div>
            );
          })}

          <input
            type="file"
            id="input"
            style={{ position: "relative", top: 250 }}
            multiple
            onChange={this.handleFiles.bind(this)}
          ></input>
          {this.state.dic && (
            <div>
              <div>Time of operation: {this.state.timeD} ms</div>
              <div>Dictionary length: {this.state.dic}</div>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default Home;
