import { ReactElement } from 'react'
import CustomTagFilters from '../Challenges/CustomTagFilters'

export default function ChallengeBar({
  challenges,
  difficulty,
  tactic,
  biggestBarValue,
  thin = false
}): ReactElement {
  let filteredChallenges = challenges
  filteredChallenges = filteredChallenges.filter((c) => c.challenge.tags.includes(tactic))

  const difficultyTags = CustomTagFilters.Difficulty[difficulty - 1].tags
  filteredChallenges = filteredChallenges.filter((c) =>
    difficulty == 2
      ? c.challenge.tags.includes('Hard') && !c.challenge.tags.includes('Very')
      : difficultyTags.map((tag) => c.challenge.tags.includes(tag)).reduce((a, b) => a && b, true)
  )

  // sort by objective stat count
  filteredChallenges.sort(
    (a, b) => a.challenge.objective.stats[0].value - b.challenge.objective.stats[0].value
  )

  const barData = filteredChallenges.map((c) => ({
    required: c.progress.objective.stats[0].targetValue,
    current: c.progress.objective.stats[0].currentValue,
    reward: c.challenge.reward.stats[0].value,
    key: c.challenge.challengeId,
    name: c.challenge.name,
    raw: c
  }))

  const difficultyName = CustomTagFilters.Difficulty[difficulty - 1].name

  console.log(difficultyName, barData)

  const maxValue = barData.at(-1)?.required ?? 0
  const maxCompleted = barData.reduce((a, b) => Math.max(a, b.current), 0)

  return (
    <div
      style={{
        display: 'flex',
        width: `100%`,
        height: thin ? 5 : 25,
        marginBottom: thin ? 1 : '0.5rem',
        lineHeight: thin ? 0 : "unset",
        transitionProperty: "height, margin, line-height",
        transitionDuration: "0.25s",
        transitionTimingFunction: "ease-in-out"
      }}
    >
      <span style={{ width: '100px', display: 'inline-block', height: '100%' }}>
        {thin ? "" : difficultyName}
      </span>

      <div
        style={{
          display: 'inline-block',
          width: 'calc(100% - 150px)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            height: '100%',
            width: `${((maxValue * 100) / biggestBarValue).toFixed(1)}%`,
            border: thin ? '' : 'solid 2px #999',
            borderRadius: '3px',
            boxSizing: 'border-box',
            transition: "border ease-in-out 0.25s"
          }}
        >
          {barData.map((bar, i, bars) => {
            const lastBar = bars[i - 1]

            const totalBarValue = lastBar ? bar.required - lastBar.required : bar.required
            const completeValue = lastBar ? bar.current - lastBar.required : bar.current
            const incompleteValue = totalBarValue - completeValue

            const toPercent = (num: number): string => `${num * 100}%`
            const totalBarWidth = toPercent(totalBarValue / maxValue)
            const completeWidth = toPercent(completeValue / totalBarValue)
            const incompleteWidth = toPercent(incompleteValue / totalBarValue)

            return (
              <span
                style={{
                  display: 'flex',
                  position: 'relative',
                  width: totalBarWidth,
                  borderRight: `${i == bars.length - 1 ? '' : 'solid 2px #999'}`,
                  boxSizing: 'border-box'
                }}
                key={bar.key}
              >
                <span
                  style={{
                    display: 'block',
                    width: completeWidth,
                    backgroundColor: '#62CD2F'
                  }}
                ></span>
                <span
                  style={{
                    display: 'block',
                    width: incompleteWidth,
                    backgroundColor: '#d9d9d9'
                  }}
                ></span>
                {!thin && totalBarValue > 9 ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: '3px'
                    }}
                  >
                    {bar.required}
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
      </div>
      <span style={{ display: 'inline-block', width: '50px', marginLeft: '1rem' }}>
        {thin ? "" : `[${maxCompleted}]`}
      </span>
    </div>
  )
}
