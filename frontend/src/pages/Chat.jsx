import { useEffect, useRef, useState } from "react";
import FileUploader from "../components/FileUploader";
import React from 'react';

function Chat() {
  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [chatToolsDisplay, setChatToolsDisplay] = useState(false);
  const [sessionId, setSessionId] = useState(Date.now());

  // Helper function to parse text with bold formatting and newlines
  const parseBoldText = (text) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g); // Split by bold markers
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        // It's a bold part
        const boldText = boldPart.slice(2, -2);
        return <span key={boldIndex} className="font-bold">{boldText}</span>;
      } else {
        // It's a regular text part, split by newlines
        const lineParts = boldPart.split('\n');
        return lineParts.map((linePart, lineIndex) => (
          <React.Fragment key={`${boldIndex}-${lineIndex}`}>
            {lineIndex > 0 && <br />} {/* Add <br /> before each line except the first */}
            <span className="font-normal">{linePart}</span> {/* Render the line with lighter font */}
          </React.Fragment>
        ));
      }
    });
  };

  // À ajouter en bas du composant Chat, avant le return
  useEffect(() => {
    // Sauvegarde de l'historique à chaque changement de session
    const hist = JSON.parse(localStorage.getItem("historique")) || [];
    // On retire l'ancien enregistrement de cette session (si déjà existant)
    const filtered = hist.filter((c) => c.id !== sessionId);
    // On ajoute la nouvelle version avec la date et les messages complets
    const updated = [
      ...filtered,
      { id: sessionId, date: new Date().toLocaleString(), messages },
    ];
    localStorage.setItem("historique", JSON.stringify(updated));
  }, [sessionId, messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user's message to the chat
    const newMessage = [...messages, { text: input, sender: "user" }];
    setMessages(newMessage);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }

    // Send message to Rasa and get response
    try {
      const response = await fetch(
        "http://localhost:5005/webhooks/rest/webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: "user", // Unique sender ID (could be dynamic)
            message: input,
          }),
        }
      );

      const data = await response.json();
      // Rasa returns an array of responses; combine them into a single message
      const botResponseText = data.map(item => item.text).join('\n');

      const botMessage = {
        text: botResponseText,
        sender: "Bot",
      };

      setMessages((prev) => [...prev, botMessage]);

      // Parler chaque réponse (if using speech synthesis)
      data.forEach((item) => {
        if (item.text && typeof parler === 'function') parler(item.text);
      });

    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", sender: "Bot" },
      ]);
    }
  };

  const defaultMessageFile = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Our Model does not have this feature yet.",
          sender: "Bot",
        },
      ]);
    }, 600);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 170) + "px";
  };

  const micRef = useRef(null); // pour le micro

  // Lance l'écoute vocale
  const lancerMicro = () => {
    const ReconnaissanceVocale =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!ReconnaissanceVocale) {
      alert("Ton navigateur ne supporte pas le micro");
      return;
    }

    const envoyerMessage = async (textePerso = null) => {
      const message = textePerso || input;
      if (!message.trim()) return;

      const nouveauMessage = [...messages, { text: message, sender: "user" }];
      setMessages(nouveauMessage);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }

      try {
        const reponse = await fetch(
          "http://localhost:5005/webhooks/rest/webhook",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: "user",
              message: message,
            }),
          }
        );

        const data = await reponse.json();

        const messagesBot = data.map((item) => ({
          text: item.text,
          sender: "Bot",
        }));

        setMessages((ancien) => [...ancien, ...messagesBot]);

        // Parler chaque réponse
        data.forEach((item) => {
          if (item.text) parler(item.text);
        });
      } catch (erreur) {
        console.error("Erreur avec Rasa :", erreur);
        setMessages((ancien) => [
          ...ancien,
          { text: "Désolé, une erreur est survenue.", sender: "Bot" },
        ]);
      }
    };

    micRef.current = new ReconnaissanceVocale();
    micRef.current.lang = "fr-FR";
    micRef.current.interimResults = false;

    micRef.current.onresult = (event) => {
      const texteEntendu = event.results[0][0].transcript;
      setInput(texteEntendu);
      envoyerMessage(texteEntendu);
    };

    micRef.current.start();
  };

  // Parle avec la voix du bot
  const parler = (texte) => {
    const phrase = new SpeechSynthesisUtterance(texte);
    phrase.lang = "fr-FR";
    speechSynthesis.speak(phrase);
  };

  return (
    <section className="relative w-full flex flex-col">
      <div className="h-[70vh] overflow-y-scroll custom-scrollbar">
        <div className="flex flex-col p-5">
          {messages.map((msg, index) => (
            <div key={index} className="flex flex-row mb-7">
              {msg.sender === "Bot" ? (
                <div className="mr-3 p-1.5 rounded-full">
                  <img
                    src="/startupgenie.png"
                    alt="Image non disponible"
                    className="w-10 h-10 rounded-full flex-1"
                  />
                </div>
              ) : (
                ""
              )}
              <div
                className={`p-2 sm:max-w-[80%] max-w-[100%] my-2 rounded-b-lg shadow-md ${
                  msg.sender === "user"
                    ? "bg-[var(--color-3)] text-[var(--color-1)] font-bold self-end ml-auto"
                    : "bg-transparent backdrop-blur-lg text-white font-secondary self-start flex-[2]"
                }`}
              >
                {msg.sender === "Bot" ? parseBoldText(msg.text) : msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-2 flex flex-row items-center justify-center w-full md:px-0">
        <div className="w-[95%] flex flex-col md:w-[60%] bg-[var(--color-3)] rounded-4xl p-2 backdrop-blur-sm shadow-[0_0_15px_10px_rgba(0,0,0,0.6)]">
          <textarea
            placeholder="Poser une question ..."
            ref={textareaRef}
            className="mb-2 w-full border-none px-4 py-2 flex-grow resize-none outline-none bg-transparent h-auto min-h-[40px] custom-scrollbar"
            rows="1"
            onChange={handleInput}
          />
          <div className="flex flex-row relative">
            <div className="flex flex-row flex-[4]">
              {/* BOUTON D'OUVERTURE DES OUTILS (le "+") */}
              {!chatToolsDisplay ? (
                <button
                  className="cursor-pointer mr-3 bg-[var(--color-1)] text-2xl font-bold text-white w-12 h-12 rounded-full flex items-center text-center justify-center flex-shrink-0"
                  onClick={() => setChatToolsDisplay(!chatToolsDisplay)}
                >
                  <i className="bx bx-plus"></i>
                </button>
              ) : (
                // GROUPE D'OUTILS AFFICHÉ APRÈS CLIC SUR LE "+"
                <div className="mr-3 w-auto p-2 rounded-full bg-[var(--color-1)] h-12 flex flex-row items-center gap-2">
                  {/* BOUTON POUR FERMER LE MENU DES OUTILS */}
                  <button
                    className="cursor-pointer w-10 h-10 flex justify-center items-center rounded-full border border-white bg-[var(--color-3)]"
                    onClick={() => setChatToolsDisplay(!chatToolsDisplay)}
                  >
                    <i className="bx bx-x text-[var(--color-1)] text-xl"></i>
                  </button>

                  {/* BOUTON POUR UPLOAD DE FICHIER (désactivé ici) */}
                  <FileUploader />

                  {/* BOUTON POUR MICROPHONE (renvoie un message par défaut) */}
                  <button
                    className="cursor-pointer w-10 h-10 flex justify-center items-center rounded-full border border-white bg-[var(--color-3)]"
                    onClick={lancerMicro}
                  >
                    <i className="bx bx-microphone text-[var(--color-1)] text-xl"></i>
                  </button>
                </div>
              )}
              {chatToolsDisplay && (
                <>
                  {/* BOUTON "Search" (peut servir à une future recherche web) */}
                  <button
                    className="cursor-pointer mr-3 font-bold border border-[var(--color-1)] bg-[var(--color-3)] text-[var(--color-1)] w-12 md:w-30 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    onClick={defaultMessageFile}
                  >
                    <i className="bx bx-globe"></i>{" "}
                    <span className="hidden md:flex">Search</span>
                  </button>
                  {/* BOUTON "Think" (autre action possible pour IA plus tard) */}
                  <button
                    className="cursor-pointer mr-3 font-bold border border-[var(--color-1)] bg-[var(--color-3)] text-[var(--color-1)] w-12 md:w-30 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    onClick={defaultMessageFile}
                  >
                    <i className="bx bx-sun"></i>{" "}
                    <span className="hidden md:flex">Think</span>
                  </button>
                </>
              )}
            </div>
            {/*button send*/}
            <button
              className="cursor-pointer text-2xl border border-[var(--color-1)] bg-[var(--color-3)] font-extrabold text-[var(--color-1)] w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              onClick={sendMessage}
            >
              <i className="bx bx-up-arrow-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Chat;