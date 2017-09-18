
$(document).ready(function () {
    buildPCTPage();

    $('#btnReadDatabase').click();
});

function buildPCTPage() {
    $('#btnCheckDatabaseExists').click(function () {
        DavesSite.PCT.PCT.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.CheckExists }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    if (objRsp.exists)
                        window.alert("exists");
                    else
                        window.alert("nah brah");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnCreateDatabase').click(function () {
        DavesSite.PCT.PCT.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Create }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully created database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnUpdateDatabase').click(function () {
        DavesSite.PCT.PCT.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Update }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully updated database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnReadDatabase').click(function () {
        DavesSite.PCT.PCT.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Read }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    $('#dataContainer').html(objRsp.data);
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });


    $('#btnDeleteDatabase').click(function () {
        DavesSite.PCT.PCT.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Delete }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully deleted database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });
}

var DatabaseMethodType = {
    CheckExists: 0,
    Create: 1,
    Update: 2,
    Read: 3,
    Delete: 4
};