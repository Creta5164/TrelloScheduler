var loginState;

function init()
{
    loginState = false;
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

//트렐로 로그인 성공
function Trello_LoginSuccess()
{
    document.body.style.background = "#fff";
    loginState = true;
}

//트렐로 로그인 실패
function Trello_LoginFail() {
    document.body.style.background = "#f00";
}

init();