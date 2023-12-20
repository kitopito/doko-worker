-- Teacherテーブル
CREATE TABLE Teacher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    lastUpdate INTEGER,
    status_id INTEGER,
    FOREIGN KEY (status_id) REFERENCES Status(id)
);

-- Statusテーブル
CREATE TABLE Status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT
);

-- Configテーブル
CREATE TABLE Config (
    teacher_id INTEGER,
    status_id INTEGER,
    sensor_id INTEGER,
    config_value INTEGER,
    PRIMARY KEY (teacher_id, status_id, sensor_id),
    FOREIGN KEY (teacher_id) REFERENCES Teacher(id),
    FOREIGN KEY (status_id) REFERENCES Status(id),
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id)
);

-- SensorValueテーブル
CREATE TABLE Sensor (
    id INTEGER PRIMARY KEY,
    teacher_id INTEGER,
    value INTEGER,
    FOREIGN KEY (teacher_id) REFERENCES Teacher(id)
);

insert into Status (id, status) values 
    (0, "在室"),
    (1, "講義"),
    (2, "出張"),
    (3, "帰宅"),
    (4, "会議"),
    (5, "学内");

insert into Teacher (id, name, status_id, updated_at) values 
    (0, "ほげ", 0, 0),
    (1, "谷口", 0, 0),
    (2, "瀬戸山", 1, 0),
    (3, "新田", 0, 0),
    (4, "小原", 3, 0),
    (5, "田中", 1, 0),
    (6, "山田", 2, 0),
    (7, "岡田", 0, 0),
    (8, "鈴木", 3, 0),
    (9, "高橋", 1, 0),
    (10, "佐藤", 2, 0),
    (11, "伊藤", 0, 0),
    (12, "渡辺", 3, 0);