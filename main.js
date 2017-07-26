let loginState;
let programLoaded;
let firstCreated;
const schedulerBoardName = "TrelloScheduler";
let schedulerBoardData;

function init() {
    loginState = false;
    programLoaded = false;
    firstCreated = false;
}

function loginTrello() {
    Trello.authorize({
        type: 'popup',
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

//트렐로 로그인 시도
function onAuthorize() {
    loginState = Trello.authorized();
    document.getElementById("logout").style.display = loginState ? "list-item" : "none";

    if (loginState && !programLoaded) loadProgram(0);
}

//트렐로 로그아웃
function logoutTrello() {
    Trello.deauthorize();
    onAuthorize();
    programLoaded = false;
    window.location.reload();
}

//트렐로 로그인 성공
function Trello_LoginSuccess() {
    loginState = true;
    document.getElementById("logout").style.display = "list-item";
    loadProgram(0);
}

//트렐로 로그인 실패
function Trello_LoginFail() {
    alert("계정 연동에 실패했습니다.");
}

//Trello 스케줄러를 시작합니다.
function loadProgram(steps, state) {
    if (programLoaded) return;
    switch (steps) {
        default:
            logoutTrello();
            return;

        case 0:
            Trello.get("/members/me/boards/",
                CheckSchedulerBoardExists,
                LoadFailed
            );
            return;
        case 1:
            
            if (state == "new")
                InitSchedulerLists(true);

            return;
    }

    //finish a loading content
    programLoaded = true;
}

//스케줄러 보드의 카드를 전부 지웁니다.
function InitSchedulerLists(force) {
    if (programLoaded) return;
    //강제 청소
    if (force) {
        Trello.get("/boards/" + schedulerBoardData.id + "/lists",
            InitLists,
            LoadFailed);

        return;
    }
}

//보드를 새로 만들 지 결정합니다, 이미 있는 경우 해당 보드 데이터를 가져옵니다.
function CheckSchedulerBoardExists(list) {
    if (programLoaded) return;
    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName) {
            schedulerBoardData = list[i];
            loadProgram(1, firstCreated ? "new" : null);
            return;
        }

    firstCreated = true;
    Trello.rest('POST', 'boards', {
            name: schedulerBoardName,
            desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
        },
        function (result) { loadProgram(0); },
        LoadFailed
    );
}

//스케줄러의 카드를 초기화합니다.
function InitLists(list) {
    for (var i = 0, len = list.length; i < len; i++)
        Trello.put("/lists/" + list[i].id + "/closed?value=true");

    InitAddLists();
}

//스케줄러의 카드를 초기화(추가)합니다.
function InitAddLists(list) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0, len = 7; i < len; i++)
        Trello.post("/lists?name=" + days[i] + "&idBoard=" + schedulerBoardData.id);
}

//로드 실패
function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
}