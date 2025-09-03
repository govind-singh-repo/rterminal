import "./App.scss";
import AutocompleteCode from "./AutocompleteCode/AutocompleteCode";

function App() {

  // useEffect(() => {
  //   console.log("Hello there");
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     console.log("Key pressed:", event.key);
  //     if (event.key === "Escape") {
  //       getCurrentWindow().hide();
  //     }
  //   };

  //   // Add event listener
  //   window.addEventListener("keydown", handleKeyDown);

  //   // Cleanup function
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []); // Empty dependency array means this runs once on mount

  return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <AutocompleteCode />
      </div>
  );
}

export default App;
