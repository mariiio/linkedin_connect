// 1. Go to https://www.linkedin.com/company/{COMPANY_NAME}/people/
// 2. Make sure your LinkedIn is in English
// 3. Modify the constants to your liking
// 4. Open chrome dev tools and paste this script or add it as a snippet

(async () => {
  // time in ms to wait before requesting to connect
  const WAIT_TO_CONNECT = 2000;
  // time in ms to wait before new employees load after scroll
  const WAIT_AFTER_SCROLL = 3000;
  // max depth of pages to scroll down to
  const MAX_SCROLLS = 5;
  // message to connect (%EMPLOYEE% and %COMPANY% will be replaced with real values)
  const MESSAGE = `Hi %EMPLOYEE%, I'm a Software Engineer with 4 yrs of experience in full-stack web development. 
	I see you're currently working at %COMPANY% where I saw a Full Stack job post and was interested to hear more about it. 
	Would you (or a colleague) have time to chat about the position?
	Thanks! Mario`;
  // keywords to filter employees in specific positions
  const POSITION_KEYWORDS = [
    "software",
    "developer",
    "full stack",
    "back end",
    "front end",
    "r&d",
  ];

  // <--> //

  function buildMessage(employee) {
    let company = document.getElementsByClassName(
      "org-top-card-summary__title"
    )[0].title;

    let replacements = { "%COMPANY%": company, "%EMPLOYEE%": employee };
    let message = MESSAGE.replace(/%\w+%/g, (i) => {
      return replacements[i];
    });

    return message.length <= 300 ? message : "";
  }

  function getButtonElements() {
    return [...document.querySelectorAll("button span")].filter((a) => {
      let cardInfo = a.offsetParent.innerText.split("\n");
      let roleIndex = cardInfo.length > 3 ? 3 : 1;
      let role = cardInfo[roleIndex];
      return (
        a.textContent.includes("Connect") &&
        POSITION_KEYWORDS.some((r) => role.match(new RegExp(r, "gi")))
      );
    });
  }

  function fillMessageAndConnect() {
    let employee = document
      .getElementById("send-invite-modal")
      .innerText.split(" ")[1];
    document.getElementById("custom-message").value = buildMessage(employee);
    document
      .getElementById("artdeco-modal-outlet")
      .getElementsByTagName("button")[2]
      .click();
    console.log(`🤝 Requested connection to ${employee}`);
  }

  async function connect(button) {
    return new Promise((resolve) => {
      setTimeout(() => {
        button.click();
        fillMessageAndConnect();
        resolve();
      }, WAIT_TO_CONNECT);
    });
  }

  async function* getConnectButtons(i) {
    let buttons = getButtonElements();
    for (i; i < buttons.length; i++) {
      yield buttons[i];
    }
    console.log("⏬ Scrolling..");
    await scroll();
    await new Promise((resolve) => setTimeout(resolve, WAIT_AFTER_SCROLL));
  }

  async function scroll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
        resolve();
      }, 0);
    });
  }

  console.log("⏳ Started connecting, please wait.");
  var connects = 0;
  try {
    for (let i = 0; i <= MAX_SCROLLS; i++) {
      for await (const button of getConnectButtons(connects)) {
        await connect(button);
        connects++;
      }
    }
    console.log(
      `✅ Done! Successfully requested connection to ${connects} people.`
    );
  } catch {
    console.log(
      `⛔ Whoops, looks like something went wrong. 
		Please go to https://github.com/mariiio/linkedin_connect and follow the instructions.`
    );
  }
})();
