<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="PCT.aspx.cs" Inherits="DavesSite.PCT.PCT" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">

    <script src="../content/js/PCT.js" type="text/javascript"></script>
    <link href="../content/css/default.css" rel="stylesheet" type="text/css" />
    <title>PCT</title>
</head>
<body>
    <form id="form1" runat="server">
        <div style="width:100%;border-bottom: 4px solid black;padding-bottom:10px">
            <div class="btn" id="btnCheckDatabaseExists">Check Database Exists</div>
            <div class="btn" id="btnCreateDatabase">Create Database</div>
            <div class="btn" id="btnUpdateDatabase">Update Database</div>
            <div class="btn" id="btnReadDatabase">Read Database</div>
            <div class="btn" id="btnDeleteDatabase">Delete Database</div>
        </div>
        <div id="dataContainer" style="padding:4px;text-align:center;width:100%">

        </div>
    </form>
</body>
</html>