using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;

using System.Text;
using System.Data.SQLite;

//TODO: NEXT, write front end to check stuff, write JS and stuff for this

namespace DavesSite.ListEverything {

    public partial class ListEverything :  classes.DavesSitePage {

        protected override void Page_Load(object sender, EventArgs e) {
            base.Page_Load(sender, e);
            AjaxPro.Utility.RegisterTypeForAjax(typeof(ListEverything));
        }

        [AjaxPro.AjaxMethod]
        public string doDatabaseMethods(string jsonDetails) {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                DatabaseMethodType methodType = (DatabaseMethodType)dic["functionType"];
                switch (methodType) {
                    case DatabaseMethodType.CheckExists:
                        return checkDatabaseExists(ref dic);
                    case DatabaseMethodType.Create:
                        return createDatabase(ref dic);
                    case DatabaseMethodType.Update:
                        return updateDatabase(ref dic);
                    case DatabaseMethodType.Read:
                        return readDatabase(ref dic);
                    case DatabaseMethodType.Delete:
                        return deleteDatabase(ref dic);
                    default:
                        return "{ \"success\": false, \"error\": \"This is not a valid database method\" }";
                }
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string checkDatabaseExists(ref Dictionary<string, object> dic) {
            try {
                if (Database.DoesDatabaseExist(Databases.ListEverything)) {
                    return "{\"success\": true, \"exists\": true }";
                } else {
                    return "{\"success\": true, \"exists\": false }";
                }
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to check if a database exists. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string createDatabase(ref Dictionary<string, object> dic) {
            var cnn = new DatabaseConnection(Databases.ListEverything);
            try {

                SQLiteCommand cmd = new SQLiteCommand(cnn.Connection);
                cmd.CommandText = "CREATE TABLE Section (" +
                    "s_ID INTEGER PRIMARY KEY NOT NULL, " +
                    "s_Name TEXT NOT NULL, " +
                    "s_Description TEXT NOT NULL)";
                cmd.ExecuteNonQuery();

                cmd.CommandText = "CREATE TABLE Item (" +
                    "i_ID INTEGER PRIMARY KEY NOT NULL, " +
                    "i_Name TEXT NOT NULL, " +
                    "i_Description TEXT NOT NULL, " +
                    "i_Section INT NOT NULL)";
                cmd.ExecuteNonQuery();

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to create a database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            } finally {
                cnn.Close();
                cnn.Dispose();
            }
        }

        private string updateDatabase(ref Dictionary<string, object> dic) {
            try {

                Section d = new Section() {
                    Name = "Sprouting",
                    Description = "List of things to sprout and how to sprout them for foods."
                };
                d.Commit();

                Item i2 = new Item() {
                    Name = "Alfalfa",
                    Description = "Rinse. Soak 4 hrs, then store for 6-8 days and gtg.",
                    Section = d
                };
                d.Commit();

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string readDatabase(ref Dictionary<string, object> dic) {
            try {

                var sb = new StringBuilder();
                var list = Section.GetObjectsWhere("");

                //foreach (Section d in list) {
                //    sb.Append("ID: ").Append(d.DataId)
                //      .Append(", Temp: ").Append(d.Temperature)
                //      .Append(", Humi: ").Append(d.Humidity)
                //      .Append(", SoilM: ").Append(d.SoilMoisture)
                //      .Append(", Light: ").Append(d.Light)
                //      .Append("<br>");
                //}

                return "{\"success\": true, \"data\": \"" + Globals.EncodeJsString(sb.ToString()) + "\" }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + ex.Message + "\"}";
            }
        }

        private string deleteDatabase(ref Dictionary<string, object> dic) {
            try {
                Database.Delete(Databases.ListEverything);

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private enum DatabaseMethodType {
            CheckExists = 0,
            Create = 1,
            Update = 2,
            Read = 3,
            Delete = 4
        }

        [AjaxPro.AjaxMethod]
        public string search(string jsonDetails) {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                string search = (string)dic["search"];

                var alSec = Section.GetObjectsWhere("s_Name = " + search);

                if (alSec.Count > 0) {
                    var alItem = Item.GetObjectsWhere("i_Section = " + alSec[0].SectionId.ToString());
                    var sb = new StringBuilder();
                    var first = true;
                    for (var i = 0; i < alItem.Count; i++) {
                        if (first) first = false; else sb.Append(", ");
                        sb.Append("{")
                            .Append("\"id\":\"").Append(alItem[i].ItemId).Append("\"")
                            .Append("\"name\":\"").Append(Globals.EncodeJsString(alItem[i].Name)).Append("\"")
                            .Append("\"desc\":\"").Append(Globals.EncodeJsString(alItem[i].Description)).Append("\" }");
                    }
                    return "{\"success\": true, \"items\": [" + sb.ToString() + "] }";
                } else {
                    return "{\"success\": true }";
                }
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        [AjaxPro.AjaxMethod]
        public string add(string jsonDetails) {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }
    }
}