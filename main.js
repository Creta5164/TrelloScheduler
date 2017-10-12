/////////////////////////////////////////////////////////////////
//      Copyright 2017 CREFFECT team All rights reserved.
//       Trello scheduler by Creta (creta5164@gmail.com)
/////////////////////////////////////////////////////////////////

let isMobile = false;
let isInWebAppiOS;
let isInWebAppChrome;

const schedulerBoardName = "TrelloScheduler";    //Trello
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const kdays = ["일", "월", "화", "수", "목", "금", "토"];
const rdays = days.reverse();
let loginState;                                  //로그인 상태 (bool)
let programLoaded;                               //프로그램이 로드 된 상태 (bool)
let firstCreated;                                //최초로 보드가 생성된 경우의 상태 (bool)
let schedulerBoardData;                          //Trello 스케줄러가 생성한 보드의 데이터 (Object)
let schedulerBoardList;                          //Trello 스케줄러의 리스트 목록 (Array > Object)

let requestCall;
let loadState;

let ConfirmPopup;
let popupContainer;

let navigationBar;
let appContent;
let cardContainer;
let ManageScheduler;
let todoLayout;

let date;
let resizeCall;

//주 진입부입니다.
function init() {
    isInWebAppiOS = (window.navigator.standalone == true);
    isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);

    window.scrollTo(0, 0);

    isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));

    popupContainer = document.getElementById('popupContainer');
    popupContainer.style.marginTop = "-25px";

    if (!(isInWebAppiOS || isInWebAppChrome) && isMobile && Cookies.get('recommandAddToHome') != 'Y') {

        popupContainer.classList.add('popupAppear');

        ConfirmPopup = function () {
            popupContainer.classList.remove('popupAppear');
            popupContainer.style.marginTop = "-25px";
            Cookies.set('recommandAddToHome', 'Y', { expires: 7 });

            ConfirmPopup = null;
        };
    }

    ShowCommandLineAlert();

    loginState = false;
    programLoaded = false;
    firstCreated = false;

    if (window.location.hash.indexOf("token=") != -1 &&
        window.location.hash.split("token=")[1].indexOf("token") == -1)
        loginTrello();

    updateLoginElements();

    InitSmoothScroll();

    navigationBar = document.getElementById("navi");
    appContent = document.getElementById("appContent");

    $(window).resize(WaitForResizeEnd);

    date = new Date();
}

function WaitForResizeEnd() {
    clearTimeout(resizeCall);
    resizeCall = setTimeout(OnResizeEvent, 100);
}

//로그인 상태를 확인하고, 표시할 것과 표시되지 말아야 할 것을 업데이트합니다.
function updateLoginElements() {
    var i, list = document.getElementsByClassName("logIn");
    for (i = 0; i < list.length; i++)
        list[i].style.display = loginState ? "" : "none";

    list = document.getElementsByClassName("logOut");
    for (i = 0; i < list.length; i++)
        list[i].style.display = !loginState ? "" : "none";

    document.body.style.overflow = loginState ? "hidden" : "auto";

    if (loginState) {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}

//Trello에 로그인 요청을 보냅니다.
function loginTrello() {
    Trello.authorize({
        type: 'redirect',
        name: 'Trello 스케줄러',
        scope: {
            read: 'true',
            write: 'true'
        },
        expiration: 'never',
        success: Trello_LoginSuccess,
        error: Trello_LoginFail
    });
}

//Trello가 로그인을 시도했을 때 호출합니다.
function onAuthorize() {
    loginState = Trello.authorized();
    updateLoginElements();

    if (loginState && !programLoaded) loadProgram(0);
}

//Trello에 로그아웃 요청을 보냅니다.
function logoutTrello() {
    Trello.deauthorize();
    onAuthorize();
    programLoaded = false;
    window.location.reload();
}

//Trello에 로그인이 성공했을 때 호출됩니다.
function Trello_LoginSuccess() {
    loginState = true;
    updateLoginElements();
    loadProgram(0);
}

//Trello에 로그인이 실패됐을 때 호출됩니다.
function Trello_LoginFail() {
    alert("계정 연동에 실패했습니다.");
}

//Trello 스케줄러를 시작합니다.
function loadProgram(steps, state) {
    if (programLoaded) return;

    document.getElementById("loadingState").innerText = "준비하고 있습니다. 잠시만 기다려주세요...";

    //document.getElementById("titleFade").style.background = "rgba(0, 153, 255, 1)";

    loadState = steps;
    requestCall = null;

    switch (steps) {
        default:
            LoadFailed();
            return;

        case 0://보드를 찾습니다.

            document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 확인하는 중...";

            Trello.get("/members/me/boards/",
                CheckSchedulerBoardExists,
                LoadFailed
            );

            return;

        case 1://보드 안의 리스트가 정상인지 확인합니다.

            document.getElementById("loadingState").innerText = "보드의 리스트를 확인하는 중...";

            Trello.get("/boards/" + schedulerBoardData.id + "/lists",
                CheckSchedulerBoardStatus,
                LoadFailed
            );

            return;

        case 2://보드의 리스트를 모두 지웁니다.

            if (schedulerBoardList.length != 0)
                RunLoadRequest(schedulerBoardList.length,
                    "리스트를 초기화하는 중...",
                    IRemoveLists,
                    3
                );
            else loadProgram(3);

            return;

        case 3://보드에 요일별로 리스트를 추가합니다.

            RunLoadRequest(rdays.length,
                "요일별 리스트를 추가하는 중...",
                ICreateLists,
                1
            );

            return;

        case 4://프로그램을 표시하기 위해 준비작업을 합니다.

            document.getElementById("loadingState").innerText = "프로그램을 준비하는 중...";
            LoadProgramLayout();

            return;

        case 5://프로그램을 준비합니다.

            document.getElementById("loadingState").innerText = "";

            setTimeout(function () {
                document.getElementById("appTitle").classList.add("alpha0");
                InitProgram();
                setTimeout(function () {
                    document.getElementById("appTitle").style.display = "none";
                }, 500);
            }, 1000);
            programLoaded = true;


            return;
    }

    //finish a loading content
    programLoaded = true;
}

/*
 * 보드를 새로 만들 지 결정합니다.
 * 이미 있는 경우, 해당 보드 데이터를 가져옵니다.
 */
function CheckSchedulerBoardExists(list) {
    if (programLoaded) return;
    schedulerBoardData = null;

    document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 찾는 중...";

    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName) {
            schedulerBoardData = list[i];
            loadProgram(1, firstCreated ? "new" : null);
            return;
        }

    document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 생성하는 중...";

    firstCreated = true;
    Trello.rest('POST', 'boards', {
        name: schedulerBoardName,
        desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
    },
        function (result) { loadProgram(0); },
        LoadFailed
    );
}

//보드의 리스트에 문제가 없는 지 확인합니다.
function CheckSchedulerBoardStatus(list) {
    if (programLoaded) return;
    schedulerBoardList = { "list": [] };

    if (list.length == 0) {
        loadProgram(3);
        return;
    }

    var curruption;
    for (var j, i = 0; i < days.length; i++) {
        curruption = true;

        for (j = 0; j < list.length; j++) {
            if (list[j].name != days[i]) continue;
            else {
                schedulerBoardList.list.push(list[j].id);
                schedulerBoardList[list[j].id] = list[j];
                curruption = false;
                break;
            }
        }

        if (curruption) {
            schedulerBoardList = list;
            loadProgram(2);
            return;
        }
    }

    schedulerBoardList.list.reverse();
    loadProgram(4);
}

//스케줄러의 보드를 하나씩 순서대로 제거합니다.
function IRemoveLists(index) {

    //사용하는 데 필요한 요일의 리스트가 이미 있으면 제거하지 않음.
    for (var i = 0; i < rdays.length; i++)
        if (rdays[i] == schedulerBoardList[index].name) {
            RunLoadAsyncResponse();
            return;
        }

    Trello.put("/lists/" + schedulerBoardList[index].id + "/closed?value=true", RunLoadAsyncResponse, LoadFailed);
}

//스케줄러의 보드를 하나씩 순서대로 추가합니다.
function ICreateLists(index) {

    //이미 해당 요일의 카드가 존재하면 추가하지 않고 진행.
    for (var i = 0; i < schedulerBoardList.length; i++)
        if (schedulerBoardList[i].name == rdays[index]) {
            RunLoadAsyncResponse();
            return;
        }
    Trello.post("/lists?name=" + rdays[index] + "&idBoard=" + schedulerBoardData.id, RunLoadAsyncResponse, LoadFailed);
}

//동기 작업을 시작합니다.
function RunLoadRequest(limit, text, callAsyncFunction, finishFunction) {

    console.log(limit == null);
    console.log(text == null);
    console.log(callAsyncFunction == null);
    console.log(finishFunction == null);
    console.log(programLoaded);

    if (limit == null || text == null || callAsyncFunction == null ||
        finishFunction == null || programLoaded) return;

    requestCall = {
        "limit": limit,
        "text": text,
        "call": callAsyncFunction,
        "finish": finishFunction,
        "async": 0
    };

    document.getElementById("loadingState").innerText = text + "(0 / " + requestCall.limit + ")";

    callAsyncFunction(0);
}

//프로그램 로드를 위한 동기 작업을 처리합니다.
function RunLoadAsyncResponse() {
    if (++requestCall.async >= requestCall.limit) {

        requestCall.async = requestCall.limit;

        if ({}.toString.call(requestCall.finish) === '[object Function]')
            setTimeout(requestCall.finishFunction, 500);
        else
            setTimeout(loadProgram, 500, requestCall.finish);
    } else
        requestCall.call(requestCall.async);

    document.getElementById("loadingState").innerText = requestCall.text + "(" + requestCall.async + " / " + requestCall.limit + ")";
}

//프로그램의 레이아웃을 준비합니다.
function LoadProgramLayout() {
    var card, _cardContainer, cardHelper, appView = document.getElementById("appView");

    _cardContainer = document.createElement('div');
    _cardContainer.classList.add("cardList");
    _cardContainer.id = "cardContainer";
    appView.appendChild((cardContainer = _cardContainer));

    cardHelper = document.createElement('div');
    cardHelper.classList.add("cardHelper");
    _cardContainer.appendChild(cardHelper);

    for (var i = 0; i < days.length; i++) {
        card = CreateCardLayout();
        card.header.innerHTML = "<a>+ 목표 추가</a>";
        card.header.setAttribute("dateId", days[i]);
        card.header.setAttribute("onclick", "CreateObjective(this);");
        card.footer.innerHTML = kdays[i] + "요일";
        card.card.id = "cards_" + days[i];

        schedulerBoardList[schedulerBoardList.list[i]].layoutData = card;
        _cardContainer.appendChild(card.card);
    }

    var todoToday = document.createElement('div');
    todoToday.id = "todoToday";
    appView.appendChild(todoToday);

    var todoDate = document.createElement('div');
    todoDate.innerHTML = "요일";
    todoDate.classList.add('date');

    var todoTitle = document.createElement('div');
    todoTitle.contentEditable = true;
    todoTitle.style.outline = "none";
    todoTitle.setAttribute("hint", "제목");
    todoTitle.classList.add('title');

    var todoDescArea = document.createElement('div');
    todoDescArea.classList.add('description');

    var todoDesc = document.createElement('div');
    todoDesc.contentEditable = true;
    todoDesc.style.outline = "none";
    todoDesc.setAttribute("hint", "내용, 설명, 해야할 일 등...");

    todoToday.appendChild(todoDate);
    todoToday.appendChild(todoTitle);
    todoToday.appendChild(todoDescArea);
    todoDescArea.appendChild(todoDesc);

    todoLayout = {
        "layout": todoToday,
        "title": todoTitle,
        "descrption": todoDesc
    };

    //todoTitle.style.display = "none";
    //todoDesc.style.display = "none";

    loadProgram(5);
}

//스케줄러를 위한 메뉴를 구성합니다.
function CreateCardLayout() {
    var card, header, main, list, footer;

    card = document.createElement('div');
    card.classList.add("card");

    header = document.createElement('div');
    header.classList.add("header");
    card.appendChild(header);

    main = document.createElement('div');
    main.classList.add("main");
    card.appendChild(main);

    list = document.createElement('div');
    list.classList.add("list");
    main.appendChild(list);

    footer = document.createElement('div');
    footer.classList.add("footer");
    card.appendChild(footer);

    return { "card": card, "header": header, "main": main, "list": list, "footer": footer };
}

//프로그램의 주 진입부입니다.
function InitProgram() {
    ManageScheduler = false;

    ReloadCardList();
    ViewToday();
}

function ReloadCardList(list) {
    var i, len;
    if (list == null) {
        for (i = 0, len = schedulerBoardList.list.length; i < len; i++) {
            schedulerBoardList[schedulerBoardList.list[i]].layoutData.list.innerHTML = "";
            Trello.get("/lists/" + schedulerBoardList[schedulerBoardList.list[i]].id + "/cards", ReloadCardList, LoadFailed);
        }
    } else {
        var cardList, cardObjective;

        var curr_date = date.getDate();
        var curr_month = date.getMonth();
        var curr_year = date.getFullYear();

        todoLayout.todoToday.innerHTML = "{0}년 {1}월 {2}일 {3}요일"
            .replace("{0}", curr_year)
            .replace("{1}", curr_month)
            .replace("{2}", curr_date)
            .replace("{3}", kdays[date.getDay()]);

        if (list.length == 0) {
            if (schedulerBoardList[list[0].idList].name == days[date.getDay()]) {
                todoLayout.todoToday.innerHTML += "<br><br>" + kdays[date.getDay()] + "요일의 일정이 없네요...<br>윗쪽을 클릭해서 일정을 추가해보세요!";
            }

            return;
        }
        cardList = schedulerBoardList[list[0].idList].layoutData.list;
        cardList.innerHTML = "";
        for (i = list.length - 1; i >= 0; i--) {
            cardObjective = document.createElement('div');
            cardObjective.classList.add("item");
            cardObjective.innerHTML = "<h1>tt</h1><p>dd</p>"
                .replace("tt", list[i].name)
                .replace("dd", list[i].desc);
            cardList.appendChild(cardObjective);
        }
    }
}

//뷰를 현재 목표로 전환합니다.
function ViewToday() {
    ManageScheduler = false;
    navigationBar.style.webkitTransform = navigationBar.style.transform
        = "translateY(calc(-100vh + 64px))";
    appContent.style.webkitTransform = appContent.style.transform
        = "translateY(calc(-100vh + 64px))";

    navigationBar.classList.add("animateView");
    appContent.classList.add("animateView");

    document.getElementById("swapViewButton").style.display = "none";
    document.getElementById("swapViewButton").style.height = "0px";

    cardContainer.style.overflowX = "";
    setTimeout(eval, 375, "cardContainer.style.height = \"\"");
    setTimeout(ViewEndAnimation, 750);

    document.getElementById("swapViewButton").onclick = ViewManageScheduler;

    setTimeout(function () {
        var ww = $("html").width();
        $("#cardContainer").stop(true, true).animate({
            scrollLeft: $("#cardContainer").scrollLeft() + $("#" + "cards_" + days[date.getDay()]).position().left - (ww / 2 - 155)
        }, 750, "easeInOutQuart");
    }, 250);
}

//뷰를 일정표 목록으로 전환합니다.
function ViewManageScheduler() {
    ManageScheduler = true;
    navigationBar.style.webkitTransform = navigationBar.style.transform
        = "translateY(0)";
    appContent.style.webkitTransform = appContent.style.transform
        = "translateY(0)";

    navigationBar.classList.add("animateView");
    appContent.classList.add("animateView");

    document.getElementById("swapViewButton").style.display = "none";
    document.getElementById("swapViewButton").style.height = "0px";

    setTimeout(eval, 375, "cardContainer.style.overflowX = \"scroll\"; cardContainer.style.height = \"calc(100vh - 150px)\";");
    setTimeout(ViewEndAnimation, 750);

    document.getElementById("swapViewButton").onclick = ViewToday;
}

//새로운 목표를 만듭니다. (폼 생성)
function CreateObjective(target) {

}

//뷰 애니메이션이 종료되었을 때, 애니메이션을 위한 transition을 제거하고, 스왑 버튼을 활성화합니다.
function ViewEndAnimation() {
    appContent.classList = []; navigationBar.classList = [];
    var swapBtn = document.getElementById("swapViewButton");

    navigationBar.setAttribute("class", "");
    appContent.setAttribute("class", "");

    swapBtn.style.display = "block";
    swapBtn.style.height = "";
    if (ManageScheduler) {
        swapBtn.style.color = "white";
        swapBtn.style.background = "";
        swapBtn.style.bottom = "0px";
        swapBtn.innerHTML = "<div class=\"verticalHelper\"></div>돌아가기";
    } else {
        swapBtn.style.color = "none";
        swapBtn.style.background = "none";
        swapBtn.style.bottom = "";
        swapBtn.innerHTML = "";
    }
}

//Trello에 요청이 실패됐을 때 호출됩니다.
function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
    window.location.reload();
}

function OnResizeEvent() {
    if (programLoaded) {
        if (!ManageScheduler) {
            var ww = $("html").width();
            $("#cardContainer").stop(true, true).animate({
                scrollLeft: $("#cardContainer").scrollLeft() + $("#" + "cards_" + days[date.getDay()]).position().left - (ww / 2 - 155)
            }, 750, "easeInOutQuart");
        }
    }
}

function ShowCommandLineAlert() {
    if ((/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) ||
        /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor))) {
        console.log("%c개발자 외 출입금지", "font-family:'spoqa han sans'; font-size:40pt; color:red;");

        console.log("%c잘 모르는 문자(텍스트, 스크립트 등)를 이곳에 붙여넣지 마세요.\nTrello 계정이 해커에게 악용될 수 있습니다!", "font-family:'spoqa han sans'; font-size:18pt; color:orange");
    } else {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n" +
            "@@@@@@@@@@@@@@@@@@개발자 외 출입금지@@@@@@@@@@@@@@@@@@@\n" +
            "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n" +
            "@@                                                  @@\n" +
            "@@  잘 모르는 문자(텍스트, 스크립트 등)를              @@\n" +
            "@@  이곳에 붙여넣지 마세요.                           @@\n" +
            "@@                                                  @@\n" +
            "@@  Trello 계정이 해커에게 악용될 수 있습니다!         @@\n" +
            "@@                                                  @@\n" +
            "@@  > _                                             @@\n" +
            "@@                                                  @@\n" +
            "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n"
        );
    }
}

//from : https://css-tricks.com/snippets/jquery/smooth-scrolling/
//모든 해시태그에 스크롤 이벤트를 추가합니다.
function InitSmoothScroll(ease) {
    if (ease == null) ease = "easeInOutQuart";
    // Select all links with hashes
    $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function (event) {
            // On-page links
            if (
                location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                location.hostname == this.hostname) {
                // Figure out element to scroll to
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                    // Only prevent default if animation is actually gonna happen
                    event.preventDefault();
                    $('html, body').stop(true, true).animate({
                        scrollTop: target.offset().top
                    }, 1000, ease, function () {
                        // Callback after animation
                        // Must change focus!
                        var $target = $(target);
                        $target.focus();
                        if ($target.is(":focus")) { // Checking if the target was focused
                            return false;
                        } else {
                            $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                            $target.focus(); // Set focus again
                        };
                    });
                }
            }
        });
}

//대상으로 스크롤합니다.
function SmoothScrollTo(name, ease) {
    if (ease == null) ease = "easeInOutQuart";
    $('html, body').stop(true, true).animate({
        scrollTop: $("#" + name).offset().top
    }, 1000, ease);
}
