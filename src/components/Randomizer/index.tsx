import React, { useState, forwardRef } from "react";
import { Fab, Typography, Box } from "@mui/material";
import { Casino as DiceIcon } from "@mui/icons-material";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import "./custom.css";

interface Outcome {
  name: string;
  url: string;
}

interface RandomizerProps {
  outcomes: Outcome[];
  title: string;
}

const Randomizer = forwardRef<HTMLButtonElement, RandomizerProps>(
  ({ outcomes, title }, ref) => {
    const [result, setResult] = useState<Outcome | null>(null);
    const [isRolling, setIsRolling] = useState<boolean>(false);
    const diceImageUrl = useBaseUrl("/img/d20.png");

    const generateRandomResult = () => {
      setIsRolling(true);
      setResult(null);

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * outcomes.length);
        setResult(outcomes[randomIndex]);
        setIsRolling(false);
      }, 1500);
    };

    return (
      <Box textAlign="center">
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Fab
          ref={ref}
          color="primary"
          onClick={generateRandomResult}
          disabled={isRolling}
          size="large"
        >
          <DiceIcon />
        </Fab>
        {isRolling && (
          <Box mt={2}>
            <img src={diceImageUrl} alt="Rolling Dice" className="dice" />
          </Box>
        )}
        {result && !isRolling && (
          <Typography variant="h5" mt={2}>
            <Link to={result.url} target="_blank">
              {result.name}
            </Link>
          </Typography>
        )}
      </Box>
    );
  }
);

Randomizer.displayName = "Randomizer";

export default Randomizer;
