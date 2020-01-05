import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
)

const options = [
  { label: 'Show some love to Material-UI', val: 'VAL' },
  { label: 'DD', val: 'VAL' },
  { label: 'SEEE', val: 'KO' },
]

interface ExamplesProps {
  setCode(code: string): void
}

export const ExamplesButton: React.SFC<ExamplesProps> = ({ setCode }) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick =
    (_e: React.MouseEvent<HTMLElement>, index: number) => {
      setCode(options[index].val)
      setAnchorEl(null)
    }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <span className={classes.root}>
      <Button
        onClick={handleClickListItem}
        size="small"
        variant="outlined"
        color="primary"
      >
        Examples
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted={true}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option.label}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </span>
  )
}
