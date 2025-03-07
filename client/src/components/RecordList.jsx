import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// THIS IS A SUB-COMPONENT THAT ONLY APPEARS IN THE "RECORDLIST" COMPONENT
const Record = (props) => (
  // EACH "RECORD" IS A TABLE ROW
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    {/* CELL WITH EMPLOYEE NAME */}
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.name}
    </td>
    {/* CELL WITH EMPLOYEE POSITION */}
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.position}
    </td>
    {/* CELL WITH EMPLOYEE LEVEL */}
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.level}
    </td>
    {/* CELL WITH EDIT AND DELETE BUTTONS */}
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        {/* REACT COMPONENT "LINK" TO GO TO EDIT SCREEN */}
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${props.record._id}`}
        >
          Edit
        </Link>
        {/* DELETE BUTTON THAT IS PASSED THE FUNCTION deleteRecord WITH PARAMETER GIVEN AS THIS RECORD'S ID */}
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteRecord(props.record._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);

  // This method fetches the records from the database.
  // CALLED WHEN THE NUMBER OF RECORDS IN THE LIST CHANGES OR WHEN RECORDLIST COMPONENT FIRST LOADS, GETS RECORDS DATA THAT MAKES LIST
  useEffect(() => {
    // UNIQUE FUNCTION CALLED IN USE EFFECT
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/record/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      // RESETS RECORDS STATE WHENEVER REACT RECORDS STATE LENGTH CHANGES
      const records = await response.json();
      setRecords(records);
    }
    getRecords(); // CALL THE UNIQUE FUNCTION
    return;
  }, [records.length]);

  // This method will delete a record
  // CALLED BY CLICKING DELETE BUTTON WITH deleteRecord AND ID AS PARAMETER
  async function deleteRecord(id) {
    // CALLS BACK END LINK TO DELETE RECORD WITH ID FROM DATABASE
    await fetch(`http://localhost:5050/record/${id}`, {
      method: "DELETE",
    });
    // CHANGES FRONT END RECORDS STATE TO INCLUDE ONLY NOT THE ID
    const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords);
  }

  // This method will map out the records on the table
  // CALLED WHEN RECORDLIST COMPONENT LOADED
  function recordList() {
    // LOOPS THROUGH EACH RECORD IN FRONT END RECORDS STATE
    return records.map((record) => {
      return (
        // MAKE A RECORD COMPONENT WITH PARAMETERS PASSED FROM RECORD DATA
        <Record
          record={record}
          deleteRecord={() => deleteRecord(record._id)}
          key={record._id}
        />
      );
    });
  }

  // This following section will display the table with the records of individuals.
  return (
    <>
      {/* <div className={`w-10 h-10 ${records.length > 3 ? 'bg-green-400' : 'animate-flash'}`}>{``}</div> */}
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          {/* TABLE WITH HEADERS */}
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Position
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Level
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            {/* TABLE BODY CONTAINS RECORDLIST FUNCTION */}
            <tbody className="[&_tr:last-child]:border-0">
              {recordList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}