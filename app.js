import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
const app = express();

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,DELETE,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/users", async (req, res) => {
  const users = await fs.readFile("./data/users.json", "utf8");
  res.json(JSON.parse(users));
});

app.get("/workspace", async (req, res) => {
  const workspace = await fs.readFile("./data/workspace.json", "utf8");
  res.json(JSON.parse(workspace));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let users = await fs.readFile("./data/users.json", "utf8");
  let workspaces = await fs.readFile("./data/workspace.json", "utf8");

  let combinedData = {};
  const data = JSON.parse(users);
  const workspaceData = JSON.parse(workspaces);

  const user = data.find(
    (user) =>
      (user.email === email || user.name === email) &&
      user.password === password
  );
  combinedData = { ...user };
  if (!user) {
    return res.status(400).json({
      message: "Invalid Credentials ",
    });
  }
  console.log("user=========>", user);
  if (user.status == "D") {
    return res.status(400).json({
      message: "Sorry ! Account is Deactivated ",
    });
  }

  if (user.role === "admin") {
    const index = workspaceData.findIndex(
      (workspace) => workspace.id == user.company
    );
    combinedData = { ...combinedData, workspace: workspaceData[index] };
  }

  res.status(200).json({
    success: true,
    ...combinedData,
    message: "Sign In Successfully !!",
  });
});

app.post("/updateUser", async (req, res) => {
  const { id } = req.body;
  let users = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(users);
  const index = data.findIndex((user) => user.id === id);

  const updatedData = { ...data[index], ...req.body };
  data[index] = updatedData;
  const updatedJsonData = JSON.stringify(data);

  fs.writeFile("./data/users.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({ success: true, ...updatedData });
});

app.post("/updateWorkspaceStatus", async (req, res) => {
  const { id, status } = req.body;

  let workspaceData = await fs.readFile("./data/workspace.json", "utf8");
  let userData = await fs.readFile("./data/users.json", "utf8");

  const data = JSON.parse(workspaceData);

  const index = data.findIndex((workspace) => workspace.id === id);

  const updatedData = { ...data[index], status };
  data[index] = updatedData;

  const updatedJsonData = JSON.stringify(data);
  fs.writeFile("./data/workspace.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({ success: true, ...updatedData });
});
app.post("/updateEmployeeStatus", async (req, res) => {
  const { id, status } = req.body;
  let EmployeeData = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(EmployeeData);
  const index = data.findIndex((employee) => employee.id === id);

  const updatedData = { ...data[index], status };
  data[index] = updatedData;

  const updatedJsonData = JSON.stringify(data);

  fs.writeFile("./data/users.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({ success: true, ...updatedData });
});
app.put("/workspace/edit", async (req, res) => {
  const { id } = req.body;

  let workspaces = await fs.readFile("./data/workspace.json", "utf8");
  const data = JSON.parse(workspaces);

  const index = data.findIndex((workspace) => workspace.id === id);

  const updatedData = { ...data[index], ...req.body };
  data[index] = updatedData;

  const updatedJsonData = JSON.stringify(data);

  fs.writeFile("./data/workspace.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({
    success: true,
    ...updatedData,
    message: "Workspace Edited Successfully !!",
  });
});
app.post("/workspace/create", async (req, res) => {
  let workspaces = await fs.readFile("./data/workspace.json", "utf8");
  let users = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(workspaces);
  const userData = JSON.parse(users);

  let workspaceRandomId = Math.floor(Math.random() * 1000);
  const newWorkspace = {
    ...req.body,
    id: workspaceRandomId,
  };
  const newUser = {
    name: req.body.name,
    id: Math.floor(Math.random() * 1000),
    email: req.body.email,
    password: req.body.password,
    company: workspaceRandomId,
    role: "admin",
    status: req.body.status,
    joiningDate: new Date(),
    profilePicture: "",
    dob: "",
    department: 22,
    mobile: req.body.mobile,
  };
  userData.push(newUser);
  data.push(newWorkspace);

  fs.writeFile("./data/workspace.json", JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });
  fs.writeFile("./data/users.json", JSON.stringify(userData), "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.status(201).json({
    success: true,
    data,
    message: "Workspace Created Successfully !!",
  });
});
app.delete("/workspace/delete", async (req, res) => {
  const { id } = req.body;
  let workspaceData = await fs.readFile("./data/workspace.json", "utf8");
  const data = JSON.parse(workspaceData);
  const updatedData = data.filter((workspace) => workspace["id"] !== id);
  const updatedJsonData = JSON.stringify(updatedData);

  fs.writeFile("./data/workspace.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({
    success: true,
    ...updatedData,
    message: "Workspace Edited Successfully !!",
  });
});

app.get("/workspace/getWorkspaceById/:id", async (req, res) => {
  const { id } = req.params;
  const workspaces = await fs.readFile("./data/workspace.json", "utf8");
  const data = JSON.parse(workspaces);
  const index = data.findIndex((workspace) => workspace.id == id);
  res.json({
    success: true,
    ...data[index],
    message: "Workspace Data Fetched Successfully !!",
  });
});

app.get("/workspace/employee/:id", async (req, res) => {
  const { id } = req.params;
  let page = req.query.page || 1;
  let limit = req.query.limit || 2;

  const workspaces = await fs.readFile("./data/workspace.json", "utf8");
  const employee = await fs.readFile("./data/users.json", "utf8");
  const department = await fs.readFile("./data/department.json", "utf8");

  const workspaceData = JSON.parse(workspaces);
  const employeeData = JSON.parse(employee);
  const departmentData = JSON.parse(department);

  const index = workspaceData.findIndex((workspace) => workspace.id == id);

  const filteredEmployeeData = employeeData.filter(
    (employee) => employee.company == id
  );
  const newData = filteredEmployeeData.map((item) => {
    const dIndex = departmentData.findIndex((dep) => dep.id == item.department);
    return {
      ...item,
      companyName: workspaceData[index].name,
      departmentName: departmentData[dIndex].departmentName,
    };
  });

  const indexOfLastItem = page * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  let pagedItems = [...newData];
  pagedItems = pagedItems.slice(indexOfFirstItem, indexOfLastItem);

  res.json({
    success: true,
    employee: newData,
    length: newData.length,
    page: page,
    limit: limit,
    totalPages: newData.length / limit,
    message: "Workspace Employee Data Fetched Successfully !!",
  });
});

app.delete("/employee/delete", async (req, res) => {
  const { id } = req.body;
  let usersData = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(usersData);
  const updatedData = data.filter((user) => user["id"] !== id);
  const updatedJsonData = JSON.stringify(updatedData);

  fs.writeFile("./data/users.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({
    success: true,
    updatedData,
    message: "Workspace Deleted Successfully !!",
  });
});

app.put("/employee/edit", async (req, res) => {
  const { id } = req.body;
  let users = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(users);
  const index = data.findIndex((user) => user.id === id);
  const updatedData = { ...data[index], ...req.body };
  data[index] = updatedData;
  const updatedJsonData = JSON.stringify(data);

  fs.writeFile("./data/users.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.json({
    success: true,
    ...updatedData,
    message: "Employee Edited Successfully !!",
  });
});

app.get("/employee/:id", async (req, res) => {
  const { id } = req.params;
  const users = await fs.readFile("./data/users.json", "utf8");
  const workspaces = await fs.readFile("./data/workspace.json", "utf8");
  const department = await fs.readFile("./data/department.json", "utf8");

  const workspaceData = JSON.parse(workspaces);
  const departmentData = JSON.parse(department);
  const userData = JSON.parse(users);

  const index = userData.findIndex((user) => user.id == id);

  let wIndex = -1,
    dIndex = -1;

  if (index !== -1 && userData[index].company) {
    wIndex = workspaceData.findIndex((w) => userData[index].company == w.id);
  }
  console.log("windex", wIndex);
  console.log("dindex", dIndex);
  if (index !== -1 && userData[index].department) {
    dIndex = departmentData.findIndex(
      (w) => userData[index].department == w.id
    );
  }

  res.json({
    success: true,
    employee: {
      ...userData[index],
      workspaceName: wIndex !== -1 ? workspaceData[wIndex].name : "",
      departmentName:
        dIndex !== -1 ? departmentData[dIndex].departmentName : "",
    },

    message: "Workspace Data Fetched Successfully !!",
  });
});

app.post("/employee/add", async (req, res) => {
  let users = await fs.readFile("./data/users.json", "utf8");
  const data = JSON.parse(users);

  const newUser = {
    ...req.body,
    id: Math.floor(Math.random() * 1000),
    joiningDate: new Date(),
  };

  data.push(newUser);

  fs.writeFile("./data/users.json", JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully.");
  });

  res.status(201).json({
    success: true,
    data,
    message: "Employee Added in workspace Successfully !!",
  });
});

app.get("/department", async (req, res) => {
  const department = await fs.readFile("./data/department.json", "utf8");
  res.json(JSON.parse(department));
});
app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: "Not found" });
});

app.listen(3000);
