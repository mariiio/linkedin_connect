// 1. Go to https://www.linkedin.com/company/{COMPANY_NAME}/people/
// 2. Make sure your LinkedIn is in English
// 3. Modify the constants to your liking
// 4. Open chrome dev tools and paste this script or add it as a snippet

(async () => {
  // maximum amount of connection requests
  const MAX_CONNECTIONS = 10;
  // time in ms to wait before requesting to connect
  const WAIT_TO_CONNECT = 2000;
  // time in ms to wait before new employees load after scroll
  const WAIT_AFTER_SCROLL = 3000;
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

  const MESSAGE_CHAR_LIMIT = 300;

  function buildMessage(employee) {
    const company = document.getElementsByClassName(
      "org-top-card-summary__title"
    )[0].title;

    const replacements = { "%COMPANY%": company, "%EMPLOYEE%": employee };
    const message = MESSAGE.replace(/%\w+%/g, (i) => {
      return replacements[i];
    });

    return message.length <= MESSAGE_CHAR_LIMIT ? message : "";
  }

  function getButtonElements() {
    return [
      ...document.querySelectorAll(
        'button[data-control-name="people_profile_card_connect_button"]'
      ),
    ].filter((button) => {
      const cardInnerText = button.offsetParent.innerText.split("\n");
      const positionIndex = cardInnerText.length > 3 ? 3 : 1;
      const position = cardInnerText[positionIndex];
      return POSITION_KEYWORDS.some((p) => position.match(new RegExp(p, "gi")));
    });
  }

  function fillMessageAndConnect() {
    const employee = document
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

  async function* getConnectButtons() {
    while ((buttons = getButtonElements()).length > 0) {
      yield* buttons;
      await loadMoreButtons();
    }
  }

  async function loadMoreButtons() {
    console.log("⏬ Scrolling..");
    await Promise.resolve(window.scrollTo(0, document.body.scrollHeight));
    return new Promise((resolve) => setTimeout(resolve, WAIT_AFTER_SCROLL));
  }

  // <--> //

  console.log("⏳ Started connecting, please wait.");
  try {
    var connections = 0;
    const buttonsGenerator = getConnectButtons();
    while (
      connections < MAX_CONNECTIONS &&
      !(next = await buttonsGenerator.next()).done
    ) {
      const button = next.value;
      await connect(button);
      connections++;
    }
    console.log(
      `✅ Done! Successfully requested connection to ${connections} people.`
    );
  } catch {
    console.log(
      `⛔ Whoops, looks like something went wrong. 
		Please go to https://github.com/mariiio/linkedin_connect and follow the instructions.`
    );
  }
})();
