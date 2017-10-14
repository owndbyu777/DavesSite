using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;

using System.Data.SQLite;

namespace DavesSite.ListEverything {
    public class Item {
        private static long nextId = 0;

        private ObjectState state;
        private bool isInDatabase = false;

        private long i_ID = 0;
        private string i_Name = "";
        private string i_Description = "";

        private Section _section = null;

        public Item() {
            state = ObjectState.Added;
            isInDatabase = false;
            i_ID = --nextId;
        }

        public Item(int id, DatabaseConnection cnn = null) {
            var didOpen = false;
            if (cnn == null) {
                cnn = new DatabaseConnection(Databases.ListEverything);
                didOpen = true;
            }

            SQLiteCommand cmd = cnn.Connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Item WHERE i_ID = @i_ID";
            cmd.Parameters.Add(new SQLiteParameter("@i_ID", i_ID));

            var rdr = cmd.ExecuteReader();
            while (rdr.Read()) {
                i_Name = (string)rdr["i_Name"];
                i_Description = (string)rdr["i_Description"];
                _section = new Section((int)rdr["i_Section"]);

                isInDatabase = true;
            }

            if (didOpen) {
                cnn.Close();
                cnn.Dispose();
            }
        }

        public long ItemId {
            get {
                return i_ID;
            }
        }

        public string Name {
            get {
                return i_Name;
            }
            set {
                i_Name = value;
                MarkAsChanged();
            }
        }

        public string Description {
            get {
                return i_Description;
            }
            set {
                i_Description = value;
                MarkAsChanged();
            }
        }

        public Section @Section {
            get {
                return _section;
            }
            set {
                _section = value;
                MarkAsChanged();
            }
        }

        public void AddDataToSB(StringBuilder sb) {
            throw new NotImplementedException();
            //sb.Append(d_Temp).Append(", ").Append(d_Humi).Append(", ").Append(d_SoilM).Append(", ").Append(d_Light);
        }


        #region "Static functions"

        static public void AddParamNamesToSB(StringBuilder sb) {
            //sb.Append("Temperature, Humidity, Soil Moisture, Light");
            throw new NotImplementedException();
        }

        #endregion

        #region "SQL Functions"

        public static List<Item> GetObjectsWhere(string sqlWhereClause, DatabaseConnection cnn = null) {
            try {
                List<Item> list = new List<Item>();

                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }

                SQLiteCommand cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "SELECT * FROM Item";
                if (!String.IsNullOrEmpty(sqlWhereClause)) cmd.CommandText += "WHERE " + sqlWhereClause;

                var rdr = cmd.ExecuteReader();
                while (rdr.Read()) {
                    Item d = new Item() {
                        i_ID = (long)rdr["i_ID"],
                        i_Name = (string)rdr["i_Name"],
                        i_Description = (string)rdr["i_Description"],
                        _section = new Section((int)rdr["i_Section"])
                    };

                    d.state = ObjectState.Nothing;
                    d.isInDatabase = true;

                    list.Add(d);
                }

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }

                return list;
            } catch (Exception ex) {
                throw new Exception("An error occured while getting Item objects WHERE from the database: " + ex.Message);
            }
        }

        public void MarkAsChanged() {
            if (state == ObjectState.Nothing) state = ObjectState.Updated;
        }

        public void Commit(DatabaseConnection cnn = null) {
            switch (state) {
                case ObjectState.Added:
                    Create(cnn);
                    break;
                case ObjectState.Updated:
                    Update(cnn);
                    break;
                case ObjectState.Deleted:
                    Delete(cnn);
                    break;
                default:
                    throw new Exception("An error occurred while committing a Item object: ObjectState not valid!");
            }
        }

        public void Create(DatabaseConnection cnn = null) {
            try {
                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }

                var cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "INSERT INTO Item (i_Name, i_Description, i_Section) VALUES(@i_Name, @i_Description, @i_Section); SELECT last_insert_rowid();";
                cmd.Parameters.Add(new SQLiteParameter("@i_Name", i_Name));
                cmd.Parameters.Add(new SQLiteParameter("@i_Description", i_Description));
                cmd.Parameters.Add(new SQLiteParameter("@i_Section", _section.SectionId));

                try {
                    i_ID = (long)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Item in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while creating a Item in the database: " + ex.Message);
            }
        }

        public void Update(DatabaseConnection cnn = null) {
            try {
                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }


                var cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "UPDATE Item SET " +
                    "i_Name = @i_Name, " +
                    "i_Description = @i_Description, " +
                    "i_Section = @i_Section " +
                    "WHERE i_ID = @i_ID";
                cmd.Parameters.Add(new SQLiteParameter("@i_Name", i_Name));
                cmd.Parameters.Add(new SQLiteParameter("@i_Description", i_Description));
                cmd.Parameters.Add(new SQLiteParameter("@i_Section", _section.SectionId));
                cmd.Parameters.Add(new SQLiteParameter("@i_ID", i_ID));

                try {
                    i_ID = (int)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Item in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while updating a Item in the database: " + ex.Message);
            }
        }

        private bool CanDelete() {
            if (!isInDatabase) {
                return false;
            } else {
                return true;
            }
        }

        public void Delete(DatabaseConnection cnn = null) {
            throw new Exception("Not full implemented yet.");

            if (CanDelete()) {
                try {
                    var didOpen = false;
                    if (cnn == null) {
                        cnn = new DatabaseConnection(Databases.ListEverything);
                        didOpen = true;
                    }

                    if (didOpen) {
                        cnn.Close();
                        cnn.Dispose();
                    }
                } catch (Exception ex) {
                    throw new Exception("An error occured while deleting a Item from the database." + ex.Message);
                }
            } else {
                throw new Exception("Cannot delete.");
            }
        }

        #endregion
    }
}