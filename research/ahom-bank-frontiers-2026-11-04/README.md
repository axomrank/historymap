# Ahom bank-specific frontiers and Guwahati chronology

Research and implementation: 4 November 2026. Barnadi, Kamrup and Guwahati concern the **western** frontier of the Ahom kingdom. North and south below mean banks of the Brahmaputra.

## Findings and adopted annual stages

| Period | North bank | South bank / Guwahati | Interpretation |
| --- | --- | --- | --- |
| Before 1614 | Inherited Bharali-side core after the Koch treaty phase | Inherited Kolong-side core | Earlier 1563–1580 north-bank Subansiri treaty stage remains separate. |
| 1614–1615 | Reach toward Barnadi after Koch Hajo collapse | Kolong core / Kajali post context | Political contact is hatched reach, not immediate annexation. |
| 1616 | Darrang dependency extends the Ahom sphere toward Barnadi | Kajali-side post envelope | Samdhara victory and Balinarayan/Dharmanarayan's dependent rule; tributary Darrang is separate from core territory. |
| 1617–1618 | Darrang dependency; failed Hajo advance | Pandu captured and fortified in November 1617, followed by retreat | Temporary Guwahati-region military presence, not continuous whole-city possession. |
| 1619–1635 | Dependent Darrang sphere | Kajali frontier context | Repeated campaigning and local submissions cannot establish a precise continuous administered frontier. |
| 1636–1637 | Hajo captured and western chiefs submit | Western military reach | Temporary advance shown separately; subsequent counter-offensive reverses it. |
| 1638 | Conservative Bharali-side envelope | Conservative Kolong-side envelope | Schematic annual war stage; no claim of a surveyed line. |
| 1639–1657 | **Barnadi** | **Asurar Ali** | Treaty of Asurar Ali explicitly has different bank boundaries. |
| 1658–1661 | Manas core envelope, farther reach toward Sankosh | Guwahati / Lower Assam | **1658–1660 capture/consolidation window**: 1658 display anchor is qualified, not a universally agreed exact capture date. |
| 1662 | Occupied Kamrup to Bharali-side frontier; farther invasion hatched | Mir Jumla takes Guwahati, then Garhgaon | Capital occupation is not permanent annexation of Upper Assam. |
| 1663–1666 | Bharali | Kolong | Ghilajharighat settlement; reduced Ahom western extent. |
| 1667–1678 | Manas | Guwahati recovered in **1667**; Saraighat defence in **1671** | Recovery must appear in 1667, not 1668 or 1671. |
| 1679–1681 | Barnadi-side rearward convention | Guwahati surrendered; Kajali-side rearward convention | Exact lines outside documented forts unresolved; outline is illustrative. |
| 1682 onward | Manas | Final Guwahati recovery; Manas envelope | Durable frontier after Gadadhar Singha's campaign, separate from the earlier recovery. |

## What “first reached Guwahati” means

Pandu, now part of Guwahati, was captured temporarily in 1617. Hajo and other western successes in the 1630s were also campaign stages. Broader Guwahati/Kamrup occupation belongs to the 1658–1660 expansion: Gait places the advance in the 1658 succession-war context, while NSOU's indexed account gives Guwahati in March 1659 and wider Kamrup in March 1660. The annual map therefore states this date range prominently rather than claiming an exact uncontested first-annexation year. Lachit's recovery was in 1667; Saraighat defended it in 1671; the final recovery followed in 1682.

Gait also describes the historical Guwahati settlement as largely on the north bank in the seventeenth century. Present-day city pins are geographic references and cannot establish historical channel positions or an exact siege perimeter.

## Geometry and uncertainty

The existing atlas's qualified `Puthimari/ Bornadi` reference trace is retained for the Barnadi convention. Names and channels have changed, and this revision does **not** verify that entire modern trace as the exact seventeenth-century Barnadi. It must not be read as a newly surveyed historical river boundary. Treaty names are firmer evidence than every bend of these modern proxy lines.

North- and south-bank masks share edges with the corresponding Mughal masks. Ahom frontier shapes are clipped to the atlas's adopted Assam envelope; the eastern Sadiya/Upper Assam envelope remains consistent across the western transitions. This does not invent a dated annexation of present-day Arunachal Pradesh. Modern administrative bounds are cartographic scope controls, not medieval sovereignty evidence. The 1638 and 1679–1681 rearward envelopes in particular remain schematic.

## Sources and access

- [E. A. Gait, *A History of Assam* (1906), public-domain scan](https://upload.wikimedia.org/wikipedia/commons/0/02/A_History_of_Assam_by_E._A._Gait.pdf): downloaded; relevant text read directly. Printed pp.104–108 (1615–1617, Darrang/Pandu), 109–116 (1630s war and 1639 terms), 125–129 (succession-war advance and Mir Jumla), 146–148 (1667), 160–161 (1682). This is a colonial-era chronicle synthesis, not a contemporary boundary survey.
- [Netaji Subhas Open University, Indian history study material](https://www.wbnsou.ac.in/online_services/SLM_UGC_DEB/UG/SOSS/HHI/1st%20Year/GE-HI-21.pdf): indexed passage checked for March 1659 Guwahati / March 1660 Kamrup. Access qualification is retained in the source ledger.
- [Kamrup district administration: Alaboi and Saraighat](https://kamrup.assam.gov.in/index.php/about-us/battle-alaboi-and-saraighat): official account explicitly dates Guwahati recovery to September–October 1667, followed by Saraighat in 1671.

## Verification

`node tools/check-ahom-frontiers.js` checks political reach versus core in 1614/1616, temporary Pandu reach, separate 1639 bank ownership, Guwahati control through the recoveries, lack of overlapping Ahom/Mughal cores at the principal transitions, stable eastern scope and contiguous bank-specific narrative stages. Other atlas checks are run after rebuilding with `node tools/build.js`. These validate data consistency; they do not remove the historical or river-course uncertainties above.
