import { ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  Collapse,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography
} from '@mui/material'
import { MouseEventHandler, ReactElement, useState } from 'react'
import ChallengeBar from './ChallengeBar'
import CustomTagFilters from '../Challenges/CustomTagFilters'

export default function ChallengeList({ challenges, type, challengeName }): ReactElement {
  const [open, setOpen] = useState(true)
  const [openStealth, setOpenStealth] = useState(true)
  const [openLoud, setOpenLoud] = useState(true)
  const [openUnique, setOpenUnique] = useState(true)

  const handleCollapseChallenge = (): void => {
    setOpen(!open)
  }

  const handleCollapseStealth = (): void => {
    setOpenStealth(!openStealth)
  }

  const handleCollapseLoud = (): void => {
    setOpenLoud(!openLoud)
  }

  const handleCollapseUnique = (): void => {
    setOpenUnique(!openUnique)
  }

  const allHeists = CustomTagFilters.Heist
  const filterChallengesByHeist = (challenges, heistName) =>
    challenges.filter(
      (c) =>
        allHeists
          .find((heist) => heist.name == heistName)
          ?.tags?.map((tag) => c.challenge.tags.includes(tag))
          ?.reduce((a, b) => a && b, true)
    )

  const findMaxChallengeValue = (challenges) =>
    challenges
      .map((c) => c.progress.objective.stats[0].targetValue)
      .reduce((a, b) => Math.max(a, b), 0)

  const difficultyTags = CustomTagFilters.Difficulty.reduce((tags, difficulty) => {
    tags.push(...difficulty.tags)
    return tags
  }, [])
  /** returns the list of challenges not about completing a number of heists on a specific difficulty */
  const filterNonCompletionChallenges = (challenges) =>
    challenges.filter((c) =>
      difficultyTags.map((tag) => !c.challenge.tags.includes(tag)).reduce((a, b) => a && b, true)
    )

  const heistChallenges = filterChallengesByHeist(challenges, challengeName)
  console.log(challengeName, heistChallenges)
  const uniqueChallenges = filterNonCompletionChallenges(heistChallenges)
  console.log('unique', uniqueChallenges)

  return (
    <Container>
      <List component="div" style={{ width: '100%', maxWidth: 1280 }}>
        <ListItemButton onClick={handleCollapseChallenge}>
          <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
          <Typography variant="h6">{challengeName}</Typography>
        </ListItemButton>

        <ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit style={{width: "100%"}}>
            {(
              [
                ['Stealth', handleCollapseStealth, openStealth],
                ['Loud', handleCollapseLoud, openLoud]
              ] as [string, MouseEventHandler, boolean][]
            ).map(([tactic, handler, isOpen]) => (
              <>
                <ListItemButton
                  key={`${tactic}-${challengeName}`}
                  onClick={handler}
                  style={{
                    paddingTop: isOpen ? undefined : '0',
                    paddingBottom: isOpen ? undefined : '0',
                    transitionProperty: 'padding-top, padding-bottom',
                    transitionDuration: '0.25s',
                    transitionTimingFunction: 'ease-in-out'
                  }}
                >
                  <ListItemIcon>{isOpen ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
                  <Typography variant="subtitle1">{tactic}</Typography>
                </ListItemButton>
                <List>
                  {[1, 2, 3, 4].map((difficultyNum) => (
                    <ChallengeBar
                      key={heistChallenges[difficultyNum]?.challenge.challengeId}
                      difficulty={difficultyNum}
                      tactic={tactic}
                      challenges={heistChallenges}
                      biggestBarValue={findMaxChallengeValue(heistChallenges)}
                      thin={!isOpen}
                    />
                  ))}
                </List>
              </>
            ))}

            <ListItemButton onClick={handleCollapseUnique}>
              <ListItemIcon>{openUnique ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
              <Typography variant="subtitle1">Unique</Typography>
            </ListItemButton>

            <ListItem>
              <Collapse in={openUnique} timeout="auto" unmountOnExit>
                <List>
                  {uniqueChallenges.map((c) => (
                    <ListItem key={c.challenge.challengeId} style={{ paddingBottom: 0 }}>
                      <Checkbox
                        onClick={(ev) => {
                          ev.preventDefault()
                        }}
                        checked={
                          c.progress.objective.stats[0].currentValue >=
                          c.progress.objective.stats[0].targetValue
                        }
                        style={{ padding: 0, cursor: 'default', pointerEvents: "none" }}
                      />
                      <span style={{ marginLeft: '1rem' }}>
                        {c.challenge.name?.replace(RegExp(`${challengeName}: `, 'i'), '')}
                      </span>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ListItem>
          </Collapse>
        </ListItem>
      </List>
    </Container>
  )
}
