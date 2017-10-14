using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;

using System.Data.SQLite;

namespace DavesSite.ListEverything {
    public class Section {
        private static long nextId = 0;

        private ObjectState state;
        private bool isInDatabase = false;

        private long s_ID = 0;
        private string s_Name = "";
        private string s_Description = "";

        public Section() {
            state = ObjectState.Added;
            isInDatabase = false;
            s_ID = --nextId;
        }

        public Section(int id, DatabaseConnection cnn = null) {
            var didOpen = false;
            if (cnn == null) {
                cnn = new DatabaseConnection(Databases.ListEverything);
                didOpen = true;
            }

            SQLiteCommand cmd = cnn.Connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Section WHERE s_ID = @s_ID";
            cmd.Parameters.Add(new SQLiteParameter("@s_ID", s_ID));

            var rdr = cmd.ExecuteReader();
            while (rdr.Read()) {
                s_Name = (string)rdr["s_Name"];
                s_Description = (string)rdr["s_Description"];

                isInDatabase = true;
            }

            if (didOpen) {
                cnn.Close();
                cnn.Dispose();
            }
        }

        public long SectionId {
            get {
                return s_ID;
            }
        }

        public string Name {
            get {
                return s_Name;
            }
            set {
                s_Name = value;
                MarkAsChanged();
            }
        }

        public string Description {
            get {
                return s_Description;
            }
            set {
                s_Description = value;
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

        public static List<Section> GetObjectsWhere(string sqlWhereClause, DatabaseConnection cnn = null) {
            try {
                List<Section> list = new List<Section>();

                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }

                SQLiteCommand cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "SELECT * FROM Section";
                if (!String.IsNullOrEmpty(sqlWhereClause)) cmd.CommandText += "WHERE " + sqlWhereClause;

                var rdr = cmd.ExecuteReader();
                while (rdr.Read()) {
                    Section d = new Section() {
                        s_ID = (long)rdr["s_ID"],
                        s_Name = (string)rdr["s_Name"],
                        s_Description = (string)rdr["s_Description"]
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
                throw new Exception("An error occured while getting Section objects WHERE from the database: " + ex.Message);
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
                    throw new Exception("An error occurred while committing a Section object: ObjectState not valid!");
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
                cmd.CommandText = "INSERT INTO Section (s_Name, s_Description) VALUES(@s_Name, @s_Description); SELECT last_insert_rowid();";
                cmd.Parameters.Add(new SQLiteParameter("@s_Name", s_Name));
                cmd.Parameters.Add(new SQLiteParameter("@s_Description", s_Description));

                try {
                    s_ID = (long)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Section in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while creating a Section in the database: " + ex.Message);
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
                cmd.CommandText = "UPDATE Section SET " +
                    "s_Name = @s_Name, " +
                    "s_Description = @s_Description, " +
                    "s_Section = @s_Section " +
                    "WHERE s_ID = @s_ID";
                cmd.Parameters.Add(new SQLiteParameter("@s_Name", s_Name));
                cmd.Parameters.Add(new SQLiteParameter("@s_Description", s_Description));
                cmd.Parameters.Add(new SQLiteParameter("@s_ID", s_ID));

                try {
                    s_ID = (int)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Section in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while updating a Section in the database: " + ex.Message);
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
                    throw new Exception("An error occured while deleting a Section from the database." + ex.Message);
                }
            } else {
                throw new Exception("Cannot delete.");
            }
        }

        #endregion
    }
}